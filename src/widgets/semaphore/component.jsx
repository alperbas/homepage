import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "tasks");

  if (tasksError) {
    return <Container service={service} error={tasksError} />;
  }

  if (!tasksData) {
    return (
      <Container service={service}>
        <Block label="semaphore.running" />
        <Block label="semaphore.failed" />
        <Block label="semaphore.succeeded" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="semaphore.running" value={t("common.number", { value: tasksData.taskRunning })} />
      <Block label="semaphore.failed" value={t("common.number", { value: tasksData.taskFailed })} />
      <Block label="semaphore.succeeded" value={t("common.number", { value: tasksData.taskSucceeded })} />
    </Container>
  );
}
