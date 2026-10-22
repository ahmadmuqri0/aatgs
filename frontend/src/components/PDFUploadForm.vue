<script setup lang="ts">
import { z } from "zod";
import { reactive, ref } from "vue";
import { createAssignment } from "../client";
import { getErrorMessage } from "../utils";

const emit = defineEmits<{ created: [] }>();

const MAX_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  file: z
    .instanceof(File, { message: "Select a PDF" })
    .refine((f) => f.type === "application/pdf", "Only PDF files are allowed")
    .refine((f) => f.size <= MAX_BYTES, "File must be 10 MB or smaller"),
});

const state = reactive<{ title: string; file: File | null }>({ title: "", file: null });
const loading = ref(false);
const toast = useToast();

async function onSubmit() {
  loading.value = true;
  try {
    await createAssignment({
      body: { title: state.title, file: state.file! },
    });
    toast.add({ title: "Document created", color: "success" });
    state.title = "";
    state.file = null;
    emit("created");
  } catch (e) {
    toast.add({ title: getErrorMessage(e), color: "error" });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="title" label="Title">
      <UInput v-model="state.title" />
    </UFormField>

    <UFormField name="file" label="Assignment brief">
      <UFileUpload
        v-model="state.file"
        accept="application/pdf"
        label="Drop your docs here"
        description="SVG, PNG, JPG or GIF"
        layout="list"
      />
    </UFormField>

    <UButton type="submit" :loading="loading">Submit</UButton>
  </UForm>
</template>
