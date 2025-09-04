<template>
  <Panel :description="$t(description)" :title="$t(title)">
    <ActionBox
      class="mb-10"
      color="green"
      v-for="service in services"
      :key="service.key"
      :title="$t(service.title)"
      :button="{
        click: () => btnFunction(service.button.href, $t(service.title)),
        theme: 'primary',
        text: $t(service.button.text),
        status: service.button.status,
      }"
      :isVertical="false"
      @click="redirectToAds"
      @submit="(param: string) => redirectToAds(param)"
    >
      <template #image>
        <img :src="service.imageSrc" class="py-4" alt="" />
      </template>
      <template #text>
        <p>{{ $t(service.description) }}</p>
      </template>
    </ActionBox>
  </Panel>
</template>

<script lang="ts" setup>
import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useCookies } from "@vueuse/integrations/useCookies";
import router from "@/router";
import ActionBox from "@/components/ActionBox.vue";
import Panel from "@/components/pages/Panel.vue";
import { useCallerId } from "@/composables/useCallerId";
import { useGoogleEvents } from "@/composables/useGoogleEvents";
import { usePageInit } from "@/composables/usePageInit";

const { locale } = useI18n();
const { getCallerId } = useCallerId();
const { gtaEvent } = useGoogleEvents();
const { remove } = useCookies();

const { pageData, title, description } = usePageInit(getCallerId, () => {
  remove("planSummary");
});

const services = computed(() => {
  return pageData.value.content?.body.services ?? [];
});

const btnFunction = (url: string, name: string) => {
  // Google Tag Manager & Analytics Events START
  gtaEvent({
    event: "GAEvent",
    eventCategory: "Click",
    eventAction: "Ürünler ve Hizmetler",
    eventLabel: name,
  });
  gtaEvent({
    event: "click",
    clickCategory: "Ürünler ve Hizmetler",
    clickName: name,
  });
  // Google Tag Manager & Analytics Events END
  router.replace({
    path: url,
  });
};

const redirectToAds = () => {
  window.location.href = "https://ads.example.com/?lang=" + locale.value;
};

defineComponent({
  name: "PanelIndex",
});
</script>
