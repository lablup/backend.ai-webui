import * as _ from 'lodash-es';

export const newLineToBrElement = (
  text: string,
  separatorRegExp = /(<br\s*\/?>|\n)/,
) => {
  return _.map(_.split(text, separatorRegExp), (line, index) => {
    return line.match(separatorRegExp) ? <br key={index} /> : line;
  });
};
