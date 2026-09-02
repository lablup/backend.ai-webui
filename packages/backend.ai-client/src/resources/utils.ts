// @ts-nocheck
export class utils {
  public client: any;

  constructor(client) {
    this.client = client;
  }

  changeBinaryUnit(value, targetUnit = 'g', defaultUnit = 'b') {
    if (value === undefined || value === null) {
      return value;
    }
    let sourceUnit;
    const binaryUnits = ['b', 'k', 'm', 'g', 't', 'p', 'auto'];
    const bBinaryUnits = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if (!binaryUnits.includes(targetUnit)) return false;
    value = value.toString();
    if (value.indexOf(' ') >= 0) {
      // Has string
      let v = value.split(/(\s+)/);
      if (bBinaryUnits.includes(v[2])) {
        value = v[0] + binaryUnits[bBinaryUnits.indexOf(v[2])];
      } else {
        value = v[0];
      }
    }
    if (binaryUnits.includes(value.substring(value.length - 1))) {
      sourceUnit = value.substring(value.length - 1);
      value = value.slice(0, -1);
    } else {
      sourceUnit = defaultUnit; // Fallback
    }
    if (targetUnit == 'auto') {
    }
    return (
      value *
      Math.pow(
        1024,
        Math.floor(
          binaryUnits.indexOf(sourceUnit) - binaryUnits.indexOf(targetUnit),
        ),
      )
    );
  }

  /**
   * Returns elapsed time between given start and end time. If end time is not set, calculate from start time to now.
   *
   * @param {string | Date | number} start - start time
   * @param {string | Date | number} end - end time
   * @return {string} - elapsed time
   */
  elapsedTime(start, end) {
    let startDate = new Date(start);
    let endDate;
    if (end === null) {
      endDate = new Date();
    } else {
      endDate = new Date(end);
    }
    // let seconds_total = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    // let seconds_cumulative = seconds_total;
    let seconds_cumulative = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );
    let days = Math.floor(seconds_cumulative / 86400);
    seconds_cumulative = seconds_cumulative - days * 86400;
    let hours = Math.floor(seconds_cumulative / 3600);
    seconds_cumulative = seconds_cumulative - hours * 3600;
    let minutes = Math.floor(seconds_cumulative / 60);
    seconds_cumulative = seconds_cumulative - minutes * 60;
    let seconds = seconds_cumulative;
    let result = '';
    if (days !== undefined && days > 0) {
      result = result + String(days) + 'd';
    }
    if (hours !== undefined) {
      result = result + this._padding_zeros(hours, 2) + ':';
    }
    if (minutes !== undefined) {
      result = result + this._padding_zeros(minutes, 2) + ':';
    }
    return result + this._padding_zeros(seconds, 2) + '';
  }

  /**
   * Returns total seconds from give elapsed time string.
   *   - ex) "1d01:54:33" -> 93273
   *
   * @param {string} daytimeString - daytime string, ex) "1d01:54:33"
   * @return {number} - total seconds
   */
  elapsedTimeToTotalSeconds(daytimeString) {
    let days, hours, minutes, seconds;
    if (daytimeString.includes('d')) {
      [days, daytimeString] = daytimeString.split('d');
    } else {
      days = 0;
    }
    [hours, minutes, seconds] = daytimeString.split(':');
    return (
      parseInt(days) * 86400 +
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds)
    );
  }

  _padding_zeros(n, width) {
    n = n + '';
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join('0') + n;
  }

  /**
   * Limit the boundary of value
   *
   * @param {number} value - input value to be clamped
   * @param {number} min - minimum value of the input value
   * @param {number} max - maximum value of the input vallue
   */
  clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  }

  gqlToObject(array, key) {
    let result = {};
    array.forEach(function (element) {
      result[element[key]] = element;
    });
    return result;
  }

  gqlToList(array, key) {
    let result: Array<any> = [];
    array.forEach(function (element) {
      result.push(element[key]);
    });
    return result;
  }
}
