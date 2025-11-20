<docs>
---
order: 1
title:
  zh-CN: 卡片模式
  en-US: Card
---

## zh-CN

用于嵌套在空间有限的容器中。

## en-US

Nested inside a container element for rendering in limited space.
</docs>

<template>
  <div :style="{ width: '300px', border: '1px solid #d9d9d9', borderRadius: '4px' }">
    {{ value?.format() }}
    <a-calendar v-model:value="value" :fullscreen="false" @panelChange="onPanelChange" />
    {{ value2?.format() }}
    <a-time-picker v-model:value="value2" />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Dayjs } from 'dayjs';

const value = ref<Dayjs>();
const value2 = ref<Dayjs>();
const onPanelChange = (value: Dayjs, mode: string) => {
  console.log(value, mode);
};

watch(value2, () => {
  console.log('value2', value2.value);
  if (value.value) {
    value.value = value.value.hour(value2.value.hour());
    value.value = value.value.minute(value2.value.minute());
    value.value = value.value.second(value2.value.second());
  }
});
</script>
