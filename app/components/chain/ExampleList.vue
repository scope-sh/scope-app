<template>
  <div class="root">
    <div class="list">
      <div class="section">
        <div class="header">contracts</div>
        <div class="items">
          <LinkAddress
            address="0x0000000071727de22e5e9d8baf0edac6f37da032"
            type="minimal"
          />
          <LinkAddress
            address="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
            type="minimal"
          />
          <LinkAddress
            address="0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
            type="minimal"
          />
        </div>
      </div>
      <div class="section">
        <div class="header">accounts</div>
        <div class="items">
          <LinkAddress
            address="0xe788017e6e15ccbdbf28014bb74fb3f07e087927"
            type="minimal"
          />
          <LinkAddress
            address="0xd463f5a92b617345023bf21e477ba77ac49926fe"
            type="minimal"
          />
          <LinkAddress
            address="0xd6245ffe1b721c463a002a9e68792f85461b894e"
            type="minimal"
          />
          <LinkAddress
            address="0x93c6ccbb372d22bfc455921893d4df7948c6cce6"
            type="minimal"
          />
        </div>
      </div>
      <div class="section">
        <div class="header">transactions</div>
        <div class="items">
          <LinkTransaction
            hash="0xd7051372a51f83264093fcf59db6b017dc40d641abce9bda3d10f6509d3efeac"
            type="minimal"
          >
            Safe Setup
          </LinkTransaction>
          <LinkTransaction
            hash="0x45140e888d672192a089f0bd694fb2a457d315440a5ffa4c2206fe9d092d9171"
            type="minimal"
          >
            Seaport Order Match
          </LinkTransaction>
          <LinkTransaction
            hash="0x05c7dab1c57b9bc6bb0cb128b1f4ee10c5cc67ef4d29782f5f2729f3e226bd32"
            type="minimal"
          >
            DEX Arbitrage
          </LinkTransaction>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
</script>

<style scoped>
.root {
  width: 100%;
}

.list {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}

.section {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.header {
  color: var(--color-text-primary);
}

.items {
  display: flex;
  gap: var(--spacing-6);
  flex-wrap: wrap;
}
</style>
