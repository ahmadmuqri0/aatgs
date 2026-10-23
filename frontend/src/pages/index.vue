<script setup lang="ts">
import { useDashboard } from "../composables/useDashboard";
</script>
<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <PDFUploadForm />
    </template>
  </UDashboardPanel>
</template>
