<script setup lang="ts">
import { ref } from "vue";

const open = ref(false);

async function onCreated() {
  open.value = false;
}
</script>
<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UModal
            v-model:open="open"
            title="add new assignment"
            description="drop your document here"
          >
            <UButton label="+ assignment" color="neutral" variant="subtle" />
            <template #body>
              <CreateAssignmentForm @created="onCreated" />
            </template>
          </UModal>
        </template>
      </UDashboardNavbar>
    </template>
  </UDashboardPanel>
</template>
