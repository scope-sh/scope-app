<template>
  <IconArrowLeft v-if="kind === 'arrow-left'" />
  <IconArrowRight v-else-if="kind === 'arrow-right'" />
  <IconArrowTopRight v-else-if="kind === 'arrow-top-right'" />
  <IconBookmark v-else-if="kind === 'bookmark'" />
  <IconBookmarkFilled v-else-if="kind === 'bookmark-filled'" />
  <IconCheck v-else-if="kind === 'check'" />
  <IconCheckCircled v-else-if="kind === 'check-circled'" />
  <IconChevronDown v-else-if="kind === 'chevron-down'" />
  <IconChevronLeft v-else-if="kind === 'chevron-left'" />
  <IconChevronRight v-else-if="kind === 'chevron-right'" />
  <IconChevronUp v-else-if="kind === 'chevron-up'" />
  <IconCircle v-else-if="kind === 'circle'" />
  <IconCode v-else-if="kind === 'code'" />
  <IconCopy v-else-if="kind === 'copy'" />
  <IconCross v-else-if="kind === 'cross'" />
  <IconCrossCircled v-else-if="kind === 'cross-circled'" />
  <IconDoubleArrowLeft v-else-if="kind === 'double-arrow-left'" />
  <IconDoubleArrowRight v-else-if="kind === 'double-arrow-right'" />
  <IconHamburger v-else-if="kind === 'hamburger'" />
  <IconHexString v-else-if="kind === 'hex-string'" />
  <IconInput v-else-if="kind === 'input'" />
  <IconJson v-else-if="kind === 'json'" />
  <IconLoop v-else-if="kind === 'loop'" />
  <IconMagnifyingGlass v-else-if="kind === 'magnifying-glass'" />
  <IconMinus v-else-if="kind === 'minus'" />
  <IconPlus v-else-if="kind === 'plus'" />
  <IconReload v-else-if="kind === 'reload'" />
  <IconText v-else-if="kind === 'text'" />
</template>

<script setup lang="ts">
import type { Kind } from './icon/general';
import IconArrowLeft from './icon/general/ArrowLeft.vue';
import IconArrowRight from './icon/general/ArrowRight.vue';
import IconArrowTopRight from './icon/general/ArrowTopRight.vue';
import IconBookmark from './icon/general/Bookmark.vue';
import IconBookmarkFilled from './icon/general/BookmarkFilled.vue';
import IconCheck from './icon/general/Check.vue';
import IconCheckCircled from './icon/general/CheckCircled.vue';
import IconChevronDown from './icon/general/ChevronDown.vue';
import IconChevronLeft from './icon/general/ChevronLeft.vue';
import IconChevronRight from './icon/general/ChevronRight.vue';
import IconChevronUp from './icon/general/ChevronUp.vue';
import IconCircle from './icon/general/Circle.vue';
import IconCode from './icon/general/Code.vue';
import IconCopy from './icon/general/Copy.vue';
import IconCross from './icon/general/Cross.vue';
import IconCrossCircled from './icon/general/CrossCircled.vue';
import IconDoubleArrowLeft from './icon/general/DoubleArrowLeft.vue';
import IconDoubleArrowRight from './icon/general/DoubleArrowRight.vue';
import IconHamburger from './icon/general/Hamburger.vue';
import IconHexString from './icon/general/HexString.vue';
import IconInput from './icon/general/Input.vue';
import IconJson from './icon/general/Json.vue';
import IconLoop from './icon/general/Loop.vue';
import IconMagnifyingGlass from './icon/general/MagnifyingGlass.vue';
import IconMinus from './icon/general/Minus.vue';
import IconPlus from './icon/general/Plus.vue';
import IconReload from './icon/general/Reload.vue';
import IconText from './icon/general/Text.vue';

defineProps<{
  kind: Kind;
}>();
</script>
