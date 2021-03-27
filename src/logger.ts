import { createLogger, config, transports, format } from "winston";
import { SyslogTransportOptions, Syslog } from "winston-syslog";

const opt: SyslogTransportOptions = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  app_name: "Slack Incident Management"
};

const colorizer = format.colorize();

const logger = createLogger({
  levels: config.syslog.levels,
  format: format.combine(
    format.timestamp(),
    format.simple(),
    format.printf(msg =>
      colorizer.colorize(
        msg.level,
        `${msg.timestamp} - ${msg.level}: ${msg.message}`
      )
    )
  ),
  transports: [new Syslog(opt), new transports.Console()]
});

export { logger };
