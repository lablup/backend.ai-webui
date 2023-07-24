import React, { useEffect, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import {
  ImageEnvironmentSelectQuery,
  ImageEnvironmentSelectQuery$data,
} from "./__generated__/ImageEnvironmentSelectQuery.graphql";
import _ from "lodash";
import { Button, Divider, Form, Select, Tag } from "antd";
import { useBackendaiImageMetaData } from "../hooks";
import ImageMetaIcon from "./ImageMetaIcon";
import Flex from "./Flex";
import { useTranslation } from "react-i18next";
import e from "express";
import TextHighlighter from "./TextHighlighter";
import DoubleTag from "./DoubleTag";
import { group } from "console";

type Image = NonNullable<
  NonNullable<ImageEnvironmentSelectQuery$data>["images"]
>[0];

type ImageGroup = {
  groupName: string;
  environmentGroups: {
    environmentName: string;
    images: Image[];
  }[];
};

const ImageEnvironmentSelect = () => {
  const form = Form.useFormInstance();

  const env = Form.useWatch("environments", form);

  const [environmentSearch, setEnvironmentSearch] = useState("");
  const [versionSearch, setVersionSearch] = useState("");
  const { t } = useTranslation();
  const [metadata, { getImageIcon, getImageMeta }] =
    useBackendaiImageMetaData();
  const { images } = useLazyLoadQuery<ImageEnvironmentSelectQuery>(
    graphql`
      query ImageEnvironmentSelectQuery($installed: Boolean) {
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
  useEffect(() => {
    if (!form.getFieldValue("environments")) {
      form.setFieldsValue({
        environments: imageGroups[0].environmentGroups[0].environmentName,
        version: getImageFullName(
          imageGroups[0].environmentGroups[0].images[0]
        ),
      });
    }
  }, []);

  const getImageFullName = (image: Image) => {
    return image
      ? `${image.registry}/${image.name}:${image.tag}@${image.architecture}`
      : undefined;
  };

  // const getKernelName = (image: Image) => {};
  const imageGroups: ImageGroup[] = _.chain(images)
    .groupBy((image) => {
      // group by using `group` property of image info
      return (
        metadata?.imageInfo[getImageMeta(getImageFullName(image) || "").key]
          ?.group || "Custom Environments"
      );
    })
    .map((images, groupName) => {
      console.log(images);
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
    .value();

  return (
    <>
      <Form.Item
        name="environments"
        label={`${t("session.launcher.Environments")} / ${t(
          "session.launcher.Version"
        )}`}
        rules={[{ required: true }]}
        style={{ marginBottom: 10 }}
      >
        <Select
          allowClear
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
              <Select.OptGroup label={group.groupName}>
                {_.map(group.environmentGroups, (environmentGroup) => {
                  const firstImage = environmentGroup.images[0];
                  return (
                    <Select.Option
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
        shouldUpdate={(prev, cur) => prev.environments !== cur.environments}
      >
        {({ getFieldValue, setFieldValue }) => {
          let selectedEnvironmentGroup:
            | ImageGroup["environmentGroups"][0]
            | undefined;
          _.find(imageGroups, (group) => {
            return _.find(group.environmentGroups, (environment) => {
              if (
                environment.environmentName === getFieldValue("environments")
              ) {
                selectedEnvironmentGroup = environment;
                return true;
              } else {
                return false;
              }
            });
          });

          if (
            !_.find(selectedEnvironmentGroup?.images, (image) => {
              return getFieldValue("version") === getImageFullName(image);
            })
          ) {
            if (selectedEnvironmentGroup?.images[0]) {
              setFieldValue(
                "version",
                getImageFullName(selectedEnvironmentGroup?.images[0])
              );
            }
          }
          return (
            <Form.Item name="version" rules={[{ required: true }]}>
              <Select
                onChange={() => {}}
                allowClear
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
    </>
  );
};

export default ImageEnvironmentSelect;
