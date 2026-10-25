<template>
  <Page class="tts-page">
    <div class="tts-inner">
      <header class="page-heading">
        <TextBlock Text="配音" FontSize="28" FontWeight="SemiBold" />
        <TextBlock
          Text="输入要配音的文本，选择语言、配音员和音频参数，然后开始配音。"
          TextWrapping="Wrap"
          Foreground="var(--TextFillColorSecondaryBrush, #5f5f5f)" />
      </header>

      <div class="tts-main">
        <div class="tts-editor">
          <TextBox
            v-model:Text="formData.text"
            AcceptsReturn
            TextWrapping="Wrap"
            PlaceholderText="请输入要配音的内容"
            class="tts-textarea" />
        </div>

        <ScrollViewer
          class="tts-tools"
          VerticalScrollBarVisibility="Auto"
          VerticalScrollMode="Auto">
          <StackPanel Spacing="16" Padding="4,0,12,8">
            <StackPanel Spacing="12">
              <ComboBox
                Header="语言"
                :ItemsSource="languageList"
                :SelectedValue="formData.language"
                PlaceholderText="请选择语言"
                @SelectionChanged="onLanguageSelection" />
              <ComboBox
                Header="配音员"
                :ItemsSource="voicesList"
                DisplayMemberPath="label"
                SelectedValuePath="value"
                :SelectedValue="formData.voice"
                PlaceholderText="请选择配音员"
                @SelectionChanged="onVoiceSelection" />
            </StackPanel>

            <div class="tts-slider-row">
              <TextBlock Text="音调" />
              <Slider
                :Value="formData.pitch"
                :Minimum="-100"
                :Maximum="100"
                :StepFrequency="1"
                @update:Value="formData.pitch = $event" />
              <TextBlock :Text="String(formData.pitch)" HorizontalAlignment="Right" />
            </div>

            <div class="tts-slider-row">
              <TextBlock Text="语速" />
              <Slider
                :Value="formData.rate"
                :Minimum="-100"
                :Maximum="100"
                :StepFrequency="1"
                @update:Value="formData.rate = $event" />
              <TextBlock :Text="String(formData.rate)" HorizontalAlignment="Right" />
            </div>

            <div class="tts-slider-row">
              <TextBlock Text="音量" />
              <Slider
                :Value="formData.volume"
                :Minimum="-100"
                :Maximum="100"
                :StepFrequency="1"
                @update:Value="formData.volume = $event" />
              <TextBlock :Text="String(formData.volume)" HorizontalAlignment="Right" />
            </div>

            <ToggleSwitch
              Header="生成字幕"
              OnContent="是"
              OffContent="否"
              :IsOn="formData.gender_sub_marker"
              @update:IsOn="onSubMarkerChange" />

            <StackPanel Spacing="8" v-if="formData.gender_sub_marker">
              <RadioButtons
                Header="字幕分词方式"
                :ItemsSource="subMarkerOptions"
                :SelectedIndex="subMarkerIndex"
                @update:SelectedIndex="onSubMarkerTypeChange" />
              <NumberBox
                v-if="formData.sub_marker_type === 'mergeByNumber'"
                Header="每段字数"
                :Minimum="1"
                :Maximum="15"
                :SmallChange="1"
                :Value="formData.merge_by_number_number"
                @update:Value="formData.merge_by_number_number = $event" />
            </StackPanel>

            <StackPanel Orientation="Horizontal" Spacing="8" VerticalAlignment="Center">
              <Button
                Content="开始配音"
                Style="{StaticResource AccentButtonStyle}"
                :IsEnabled="!buttonLoadingObject.startTTSBtn"
                @Click="startTTS" />
              <Button
                Content="更新配音员"
                :IsEnabled="!buttonLoadingObject.updataVoices"
                @Click="updataVoices" />
              <ProgressRing
                v-if="buttonLoadingObject.startTTSBtn || buttonLoadingObject.updataVoices"
                :IsActive="true"
                :Width="20"
                :Height="20" />
            </StackPanel>
          </StackPanel>
        </ScrollViewer>
      </div>

      <div class="tts-player">
        <audio ref="audioDom" controls class="tts-audio"></audio>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, toRaw, onMounted, onUnmounted } from 'vue';
    import { useVoicesStore } from '../store/voices';
    import { invoke } from '@tauri-apps/api/core';
    import mitter from '../utils/mitt';
    import { show_error } from '../utils/function';
    import { useOptionStore } from '../store/option';

    const voicesStore = useVoicesStore();
    const optionStore = useOptionStore();

    const formData = reactive({
        text: "",
        language: "",
        voice: "",
        pitch: 0,
        rate: 0,
        volume: 0,
        gender_sub_marker: true,
        sub_marker_type: "mergeByPunctuation",
        merge_by_number_number: 1
    });

    const subMarkerOptions = ["按标点分隔", "自动分词", "按数字分词"];
    const subMarkerTypes = ["mergeByPunctuation", "autoWord", "mergeByNumber"];

    const languageList = ref<string[]>([]);
    const voicesList = ref<Array<{ label: string; value: string }>>([]);
    const sub_marker_typeBox = ref(true);
    const audioDom = ref<HTMLAudioElement | null>(null);


    // 按钮Loading对象
    const buttonLoadingObject = reactive({
        updataVoices: false,
        startTTSBtn: false,
        tryPlayBtn: false
    });

    onMounted(()=>{
        // 监听mitt事件
        mitter.on("updataVoices", ()=>{
            buttonLoadingObject.updataVoices = true;
        })

        mitter.on("updataVoicesed", ()=>{
            buttonLoadingObject.updataVoices = false;
        })
    })

    onUnmounted(()=>{
        mitter.off("updataVoices");
        mitter.off("updataVoicesed");
    })

    const updataVoices = async ()=>{
        voicesStore.updataVoices().then(()=>{
            renderLanguage();
        }).catch((error)=>{
            show_error(error);
        })
    }

    const onLanguageSelection = (sender, args)=>{
        const language = args?.AddedItems?.[0];
        if(typeof language !== "string" || language === ""){
            return;
        }
        formData.language = language;
        randerVoices(language, true);
    }

    const onVoiceSelection = (sender, args)=>{
        const voice = args?.AddedItems?.[0];
        if(!voice){
            return;
        }
        formData.voice = voice.value;
    }

    const onSubMarkerChange = (value)=>{
        formData.gender_sub_marker = value;
        sub_marker_typeBox.value = value;
    }

    const subMarkerIndex = computed(() => subMarkerTypes.indexOf(formData.sub_marker_type));

    const onSubMarkerTypeChange = (index)=>{
        if(index >= 0 && index < subMarkerTypes.length){
            formData.sub_marker_type = subMarkerTypes[index];
        }
    }

    const startTTS = ()=>{
        ttsFun(toRaw(formData)).then((result)=>{
            console.log(result);
            // 载入base64音频
            if(audioDom.value){
                audioDom.value.src = "data:audio/mp3;base64," + result.data.audio;
                audioDom.value.play();
            }
        }).catch((error)=>{
            console.log(error)
            show_error(error);
        }).finally(()=>{
            buttonLoadingObject.startTTSBtn = false;
            buttonLoadingObject.tryPlayBtn = false;
        })
    }

    // tts配音函数
    function ttsFun(ttsOption){
        return new Promise(async (resolve, reject) => {

            if(optionStore.softOption.saveTTSOptions){
                // 保存tts的设置
                optionStore.updataTTSOption(ttsOption);
            }

            if(ttsOption.text == ""){
                reject("请输入要配音的内容");
                return;
            }

            buttonLoadingObject.startTTSBtn = true;
            buttonLoadingObject.tryPlayBtn = true;

            try {
                const result = await invoke("start_tts", {data: {
                    ...ttsOption,
                    // 额外参数
                    root_path: optionStore.softOption.savePath,
                    open_folders: optionStore.softOption.openFolders
                }});
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        })
    }

    function renderLanguage(){
        languageList.value = Object.keys(voicesStore.voices ?? {});

        if(!languageList.value.includes(formData.language)){
            formData.language = languageList.value[0] ?? "";
        }

        randerVoices(formData.language);
    }

    function randerVoices(language, enforcement = false){
        const voices = voicesStore.voices?.[language] ?? [];

        voicesList.value = voices.map((voice) => ({
            label: voice.simpleName + " (" + voice.Gender + ")",
            value: voice.Name
        }));

        if(voicesList.value.length === 0){
            formData.voice = "";
            return;
        }

        const exists = voicesList.value.some((item) => item.value === formData.voice);
        if(enforcement || !exists){
            formData.voice = voicesList.value[0].value;
        }
    }

    // 更新tts选项
    Object.assign(formData, optionStore.ttsOption ?? {});
    sub_marker_typeBox.value = formData.gender_sub_marker;
    // 渲染
    renderLanguage();
</script>

<style scoped>
    .tts-page {
        grid-template-rows: minmax(0, 1fr);
    }

    .tts-inner {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        height: 100%;
    }

    .tts-main {
        display: flex;
        flex: 1 1 auto;
        gap: 24px;
        min-width: 0;
        min-height: 0;
        padding: 0 32px 16px;
    }

    .tts-editor {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
    }

    .tts-tools {
        max-width: 440px;
        min-width: 0;
        min-height: 0;
    }

    .tts-slider-row {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr) 48px;
        align-items: center;
        gap: 8px;
    }

    .tts-player {
        padding: 0 32px 24px;
    }

    .tts-audio {
        width: 100%;
        height: 36px;
    }
</style>

<style>
    /* TextBox 需要撑满编辑区高度 */
    .tts-textarea {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .tts-textarea .win-textbox-border {
        flex: 1 1 auto;
        min-height: 0;
    }

    .tts-textarea .win-textbox-content {
        min-height: 0;
    }

    .tts-textarea .win-textbox-content-element {
        height: 100%;
    }

    .tts-textarea .scroll-content {
        height: 100% !important;
        min-height: 100% !important;
    }

    .tts-textarea .win-textbox-textarea {
        width: 100% !important;
        height: 100% !important;
        resize: none;
    }
</style>
