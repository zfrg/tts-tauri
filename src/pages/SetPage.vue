<template>
  <Page class="set-page">
    <div class="set-inner">
      <header class="page-heading">
        <TextBlock Text="设置" FontSize="28" FontWeight="SemiBold" />
        <TextBlock
          Text="配置配音文件的保存位置与应用行为。"
          TextWrapping="Wrap"
          Foreground="var(--TextFillColorSecondaryBrush, #5f5f5f)" />
      </header>

      <ScrollViewer
        class="set-scroll"
        VerticalScrollBarVisibility="Auto"
        VerticalScrollMode="Auto">
        <StackPanel class="set-stack" Spacing="8" MaxWidth="1000">
          <SettingsCard Header="保存位置" Description="配音文件与字幕的输出目录">
            <StackPanel Orientation="Horizontal" Spacing="12" VerticalAlignment="Center">
              <TextBlock
                :Text="form.savePath"
                TextWrapping="Wrap"
                VerticalAlignment="Center"
                MaxWidth="520" />
              <Button Content="选择文件夹" @Click="selectFolder" />
            </StackPanel>
          </SettingsCard>

          <SettingsCard Header="保存 TTS 设置" Description="关闭后每次启动都使用默认配音参数">
            <ToggleSwitch
              OnContent="是"
              OffContent="否"
              :IsOn="form.saveTTSOptions"
              @update:IsOn="form.saveTTSOptions = $event" />
          </SettingsCard>

          <SettingsCard Header="自动打开文件夹" Description="配音完成后自动打开输出目录">
            <ToggleSwitch
              OnContent="是"
              OffContent="否"
              :IsOn="form.openFolders"
              @update:IsOn="form.openFolders = $event" />
          </SettingsCard>

          <SettingsCard Header="开源地址" Description="检查更新或反馈问题">
            <StackPanel Orientation="Horizontal" Spacing="8">
              <HyperlinkButton Content="GitHub" @Click="openBrowser('https://github.com/zs1083339604/tts-tauri.git')" />
              <HyperlinkButton Content="Gitee" @Click="openBrowser('https://gitee.com/lieranhuasha/tts-tauri.git')" />
            </StackPanel>
          </SettingsCard>

          <SettingsCard Header="当前版本" Description="tts-tauri 0.2.1">
            <TextBlock Text="2025-05-09 更新" Foreground="var(--TextFillColorSecondaryBrush, #5f5f5f)" />
          </SettingsCard>

          <div class="set-actions">
            <Button
              Content="保存"
              Style="{StaticResource AccentButtonStyle}"
              :IsEnabled="!saving"
              @Click="onSubmit" />
            <ProgressRing v-if="saving" :IsActive="true" :Width="20" :Height="20" />
          </div>
        </StackPanel>
      </ScrollViewer>
    </div>
  </Page>
</template>

<script setup lang="ts">
    import { reactive, ref, toRaw } from 'vue';
    import { useOptionStore } from '../store/option';
    import { open } from '@tauri-apps/plugin-dialog';
    import { open as openShell } from '@tauri-apps/plugin-shell';
    import { show_error, show_success } from '../utils/function';

    const optionStore = useOptionStore();
    const saving = ref(false);

    const form = reactive({
        savePath: "",
        openFolders: true,
        saveTTSOptions: true
    })

    const onSubmit = ()=>{
        saving.value = true;
        optionStore.updataSoftOption(toRaw(form)).then(()=>{
            show_success("设置已保存");
        }).catch((error)=>{
            show_error(error);
        }).finally(()=>{
            saving.value = false;
        })
    }

    const selectFolder = async ()=>{
        try {
            const file = await open({
                multiple: false,
                directory: true,
                defaultPath: form.savePath
            });

            if(file != null){
                // 选择了文件夹
                form.savePath = file.replaceAll("\\", "/");
            }
        } catch (error) {
            show_error(error);
        }
    }

    const openBrowser = async (url)=>{
        try {
            await openShell(url);
        } catch (error) {
            show_error(error);
        }
    }

    Object.assign(form, optionStore.softOption ?? {});
</script>

<style scoped>
    .set-page {
        grid-template-rows: minmax(0, 1fr);
    }

    .set-inner {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        height: 100%;
    }

    .set-scroll {
        flex: 1 1 auto;
        min-height: 0;
        padding: 0 32px 24px;
        box-sizing: border-box;
    }

    .set-stack {
        width: 100%;
        max-width: 1000px;
    }

    .set-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 12px;
    }
</style>
