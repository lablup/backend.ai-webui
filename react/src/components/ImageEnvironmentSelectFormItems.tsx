import React, { useEffect, useMemo, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import _ from "lodash";
import {
  Button,
  ConfigProvider,
  Divider,
  Empty,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import { useBackendaiImageMetaData } from "../hooks";
import ImageMetaIcon from "./ImageMetaIcon";
import Flex from "./Flex";
import { useTranslation } from "react-i18next";
import e from "express";
import TextHighlighter from "./TextHighlighter";
import DoubleTag from "./DoubleTag";
import {
  ImageEnvironmentSelectFormItemsQuery,
  ImageEnvironmentSelectFormItemsQuery$data,
} from "./__generated__/ImageEnvironmentSelectFormItemsQuery.graphql";

type Image = NonNullable<
  NonNullable<ImageEnvironmentSelectFormItemsQuery$data>["images"]
>[0];

type ImageGroup = {
  groupName: string;
  environmentGroups: {
    environmentName: string;
    images: Image[];
  }[];
};

export type ImageEnvironmentFormInput = {
  environments: {
    environment: string;
    version: string;
    digest: string;
  };
};

interface ImageEnvironmentSelectFormItemsProps {
  filter?: (image: Image) => boolean;
}

const getImageFullName = (image: Image) => {
  return image
    ? `${image.registry}/${image.name}:${image.tag}@${image.architecture}`
    : undefined;
};

const ImageEnvironmentSelectFormItems: React.FC<
  ImageEnvironmentSelectFormItemsProps
> = ({ filter }) => {
  const form = Form.useFormInstance<ImageEnvironmentFormInput>();
  const currentEnvironmentsFormData = Form.useWatch("environments", form);

  const [environmentSearch, setEnvironmentSearch] = useState("");
  const [versionSearch, setVersionSearch] = useState("");
  const { t } = useTranslation();
  const [metadata, { getImageIcon, getImageMeta }] =
    useBackendaiImageMetaData();
  const { images } = useLazyLoadQuery<ImageEnvironmentSelectFormItemsQuery>(
    graphql`
      query ImageEnvironmentSelectFormItemsQuery($installed: Boolean) {
        images(is_installed: $installed) {
          name
          humanized_name
          tag
          registry
          architecture
          digest
          installed
          resource_limits {
            key
            min
            max
          }
          labels {
            key
            value
          }
        }
      }
    `,
    {
      installed: true,
    }
  );

  // If not initial value, select first value
  // auto select when relative field is changed
  useEffect(() => {
    // if not initial value, select first value
    const nextEnvironmentName =
      currentEnvironmentsFormData?.environment ||
      imageGroups[0]?.environmentGroups[0]?.environmentName;

    let nextEnvironmentGroup: ImageGroup["environmentGroups"][0] | undefined;
    _.find(imageGroups, (group) => {
      return _.find(group.environmentGroups, (environment) => {
        if (environment.environmentName === nextEnvironmentName) {
          nextEnvironmentGroup = environment;
          return true;
        } else {
          return false;
        }
      });
    });

    console.log(nextEnvironmentGroup);
    // if current version does'nt exist in next environment group, select a version of the first image of next environment group
    if (
      !_.find(
        nextEnvironmentGroup?.images,
        (image) =>
          currentEnvironmentsFormData?.version === getImageFullName(image)
      )
    ) {
      const nextNewImage = nextEnvironmentGroup?.images[0];
      console.log(nextNewImage);
      if (nextNewImage) {
        form.setFieldsValue({
          environments: {
            environment: nextEnvironmentName,
            version: getImageFullName(nextNewImage),
            digest: nextNewImage.digest || undefined,
          },
        });
      }
    }
  }, [currentEnvironmentsFormData?.environment]);

  const imageGroups: ImageGroup[] = useMemo(
    () =>
      _.chain(images)
        .filter(filter ? filter : () => true)
        .groupBy((image) => {
          // group by using `group` property of image info
          return (
            metadata?.imageInfo[getImageMeta(getImageFullName(image) || "").key]
              ?.group || "Custom Environments"
          );
        })
        .map((images, groupName) => {
          return {
            groupName,
            environmentGroups: _.chain(images)
              // sub group by using (environment) `name` property of image info
              .groupBy((image) => {
                return (
                  metadata?.imageInfo[
                    getImageMeta(getImageFullName(image) || "").key
                  ]?.name || image?.name
                );
              })
              .map((images, environmentName) => ({
                environmentName,
                images,
              }))
              .sortBy((item) => item.environmentName)
              .value(),
          };
        })
        .sortBy((item) => item.groupName)
        .value(),
    [images, metadata, filter]
  );

  return (
    <>
      <Form.Item
        name={["environments", "environment"]}
        label={`${t("session.launcher.Environments")} / ${t(
          "session.launcher.Version"
        )}`}
        rules={[{ required: true }]}
        style={{ marginBottom: 10 }}
      >
        <Select
          showSearch
          autoClearSearchValue
          labelInValue={false}
          searchValue={environmentSearch}
          onSearch={setEnvironmentSearch}
          defaultActiveFirstOption={true}
          optionLabelProp="label"
        >
          {_.map(imageGroups, (group) => {
            return (
              <Select.OptGroup key={group.groupName} label={group.groupName}>
                {_.map(group.environmentGroups, (environmentGroup) => {
                  const firstImage = environmentGroup.images[0];
                  return (
                    <Select.Option
                      key={environmentGroup.environmentName}
                      value={environmentGroup.environmentName}
                      label={
                        <Flex direction="row">
                          <Flex direction="row" align="center" gap="xs">
                            <ImageMetaIcon
                              image={getImageFullName(firstImage) || ""}
                              style={{
                                width: 15,
                                height: 15,
                              }}
                            />
                            {environmentGroup.environmentName}
                          </Flex>
                        </Flex>
                      }
                    >
                      <Flex direction="row" justify="between">
                        <Flex direction="row" align="center" gap="xs">
                          <ImageMetaIcon
                            image={getImageFullName(firstImage) || ""}
                            style={{
                              width: 15,
                              height: 15,
                            }}
                          />
                          <TextHighlighter keyword={environmentSearch}>
                            {environmentGroup.environmentName}
                          </TextHighlighter>
                        </Flex>
                        <Flex direction="row" gap="xs">
                          {/* <Tag>Multiarch</Tag> */}
                        </Flex>
                      </Flex>
                    </Select.Option>
                  );
                })}
              </Select.OptGroup>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.environments?.environments !== cur.environments?.environment
        }
      >
        {({ getFieldValue }) => {
          let selectedEnvironmentGroup:
            | ImageGroup["environmentGroups"][0]
            | undefined;
          _.find(imageGroups, (group) => {
            return _.find(group.environmentGroups, (environment) => {
              if (
                environment.environmentName ===
                getFieldValue("environments")?.environment
              ) {
                selectedEnvironmentGroup = environment;
                return true;
              } else {
                return false;
              }
            });
          });
          return (
            <Form.Item
              name={["environments", "version"]}
              rules={[{ required: true }]}
            >
              <Select
                onChange={() => {}}
                showSearch
                searchValue={versionSearch}
                onSearch={setVersionSearch}
                autoClearSearchValue
                optionLabelProp="label"
              >
                {_.map(
                  _.uniqBy(selectedEnvironmentGroup?.images, "digest"),
                  (image) => {
                    const [version, tag, requirements] = image?.tag?.split(
                      "-"
                    ) || ["", "", ""];
                    return (
                      <Select.Option
                        key={image?.digest}
                        value={getImageFullName(image)}
                        label={[
                          version,
                          metadata?.tagAlias[tag],
                          image?.architecture,
                          metadata?.tagAlias[requirements]?.split(":")[1],
                        ]
                          .filter((v) => !!v)
                          .join(" / ")}
                      >
                        <Flex direction="row">
                          {version}
                          <Divider type="vertical" />
                          {metadata?.tagAlias[tag]}
                          <Divider type="vertical" />
                          {image?.architecture}
                          <Divider type="vertical" />
                          {requirements && (
                            <DoubleTag
                              values={
                                metadata?.tagAlias[requirements].split(":") || [
                                  "",
                                  "",
                                ]
                              }
                            />
                          )}
                        </Flex>
                      </Select.Option>
                    );
                  }
                )}
              </Select>
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item noStyle hidden name={["environments", "digest"]}>
        <Input />
      </Form.Item>
    </>
  );
};

export default ImageEnvironmentSelectFormItems;
