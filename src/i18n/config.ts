import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'ThisDictation Helper': 'ThisDictation Helper',
      'Content Input': 'Content Input',
      'Enter words (one per line)': 'Enter words (one per line)',
      'Text Upload': 'Text Upload',
      'Voice Upload': 'Voice Upload',
      'Image Upload': 'Image Upload',
      'Dictation Settings': 'Dictation Settings',
      'Reading Speed': 'Reading Speed',
      'Interval (seconds)': 'Interval (seconds)',
      'Repetitions': 'Repetitions',
      'Pronunciation': 'Pronunciation',
      'Play': 'Play',
      'Pause': 'Pause',
      'Stop': 'Stop',
      'Previous': 'Previous',
      'Next': 'Next',
      'Delete': 'Delete',
      'Delete All': 'Delete All',
      'Export': 'Export',
      'Cancel': 'Cancel',
      'Confirm': 'Confirm',
      'Start Recording': 'Start Recording',
      'Stop Recording': 'Stop Recording',
      'Record Again': 'Record Again',
      'Enter words to practice (one per line)': 'Enter words to practice (one per line)',
      'Recognize': 'Recognize',
      'Language': 'Language',
      'Cantonese': 'Cantonese',
      'Mandarin': 'Mandarin',
      'English': 'English',
      'Failed to process audio': 'Failed to process audio',
      'Are you sure you want to delete all words?': 'Are you sure you want to delete all words?',
      'There is no word to be added.': 'There is no word to be added.',
      'Word Progress': 'Word Progress',
      'Current Repetition': 'Current Repetition',
      'No words added': 'No words added',
      'of': 'of',
      'word(s)': 'word(s)',
      'Key Features:': 'Key Features:',
      'Guide': 'Guide',
      'Welcome to ThisDictation Helper!': 'Welcome to ThisDictation Helper!',
      'user_guide.introduction': 'ThisDictation Helper is your perfect companion for creating and practicing dictation exercises. Whether you\'re a teacher preparing materials or a parent helping your child improve their language skills, our tool makes the process simple and effective.',
      'user_guide.feature_1': 'Multiple input methods: text, voice, and image recognition',
      'user_guide.feature_2': 'Customizable reading speed and intervals',
      'user_guide.feature_3': 'Support for multiple languages (English, Cantonese, Mandarin)',
      'user_guide.feature_4': 'Word-by-word playback with repetition options',
      'user_guide.feature_5': 'Easy export and import of word lists for sharing and revision',
      'user_guide.getting_started': 'To get started, simply enter your words in the text area, or use voice/image upload. You can also import existing word lists.',
      'Got it!': 'Got it!',
      'Import txt file': 'Import txt file',
      'Select a txt file': 'Select a txt file',
      'Document Language': 'Document Language',
      'Traditional Chinese': 'Traditional Chinese',
      'Simplified Chinese': 'Simplified Chinese',
      'Dictation Player': 'Dictation Player',
      'or': 'or',
      'Number of Repetitions': 'Number of Repetitions',
      'Reading Interval': 'Reading Interval',
      'Upload Image': 'Upload Image',
      'Processing...': 'Processing...',
      'Recognized text will appear here...': 'Recognized text will appear here...',
      'Please provide the words': 'Please provide the words',
      'Take Photo': 'Take Photo',
      'Select a file': 'Select a file',
      'You can edit the transcribed text here or directly input the words you said': 'You can edit the transcribed text here or directly input the words you said',
      'Record Only': 'Record Only',
      'Record with Recognition': 'Record with Recognition',
      'Speech Recognition is only provided in PC version.': 'Speech Recognition is only provided in PC version.',
      'Update Successful': 'Update Successful',
    }
  },
  'zh-TW': {
    translation: {
      'ThisDictation Helper': 'ThisDictation 默書助手',
      'Content Input': '內容輸入',
      'Enter words (one per line)': '輸入單字或詞組（每行當作一個詞組）',
      'Text Upload': '文字上傳',
      'Voice Upload': '語音上傳',
      'Image Upload': '圖片上傳',
      'Dictation Settings': '默書設定',
      'Reading Speed': '朗讀速度',
      'Interval (seconds)': '間隔（秒）',
      'Repetitions': '重複次數',
      'Pronunciation': '發音',
      'Play': '播放',
      'Pause': '暫停',
      'Stop': '停止',
      'Previous': '上一個',
      'Next': '下一個',
      'Delete': '刪除',
      'Delete All': '全部刪除',
      'Export': '匯出',
      'Cancel': '取消',
      'Confirm': '確認',
      'Start Recording': '開始錄音',
      'Stop Recording': '停止錄音',
      'Record Again': '重新錄音',
      'Enter words to practice (one per line)': '輸入你想練習的詞語（每行一個）',
      'Recognize': '識別',
      'Language': '語言',
      'Cantonese': '廣東話',
      'Mandarin': '普通話',
      'English': '英語',
      'Failed to process audio': '音訊處理失敗',
      'Are you sure you want to delete all words?': '確定要刪除所有單字嗎？',
      'There is no word to be added.': '沒有可新增的單字。',
      'Word Progress': '單字進度',
      'Current Repetition': '目前重複次數',
      'No words added': '尚未新增單字',
      'of': '之',
      'word(s)': '個單字',
      'Key Features:': '主要功能：',
      'Guide': '使用指南',
      'Welcome to ThisDictation Helper!': '歡迎使用 ThisDictation 默書助手！',
      'user_guide.introduction': 'ThisDictation 默書助手是您製作和練習默書的最佳夥伴。無論您是準備教材的老師，還是幫助孩子提升語言能力的家長，我們的工具都能讓整個過程變得簡單有效。',
      'user_guide.feature_1': '多種輸入方式：文字、語音和圖片識別',
      'user_guide.feature_2': '可自訂朗讀速度和間隔時間',
      'user_guide.feature_3': '支援多種語言（英語、粵語、國語）',
      'user_guide.feature_4': '逐字播放並可重複',
      'user_guide.feature_5': '方便匯出和匯入單字清單，便於分享和複習',
      'user_guide.getting_started': '開始使用時，只需在文字區域輸入單字，或使用語音/圖片上傳。您也可以匯入現有的單字清單。',
      'Got it!': '知道了！',
      'Import txt file': '匯入TXT檔',
      'Select a txt file': '選擇TXT檔',
      'Document Language': '文件語言',
      'Traditional Chinese': '繁體中文',
      'Simplified Chinese': '簡體中文',
      'Dictation Player': '默書播放器',
      'or': '或',
      'Failed to process image': '圖片處理失敗，請重試',
      'No text found in image': '圖片中未找到文字',
      'No response from OCR service': 'OCR服務無回應',
      'Request timed out': '請求超時，請重試',
      'Please provide the words': '請提供詞組',
      'Take Photo': '拍照片',
      'Select a file': '選擇檔案',
      'Number of Repetitions': '重複次數',
      'Reading Interval': '朗讀間隔 (秒)',
      'Upload Image': '上傳圖片',
      'Processing...': '處理中...',
      'Recognized text will appear here...': '識別文字將出現在這裡...',
      'You can edit the transcribed text here or directly input the words you said': '您可以在此編輯轉錄的文字或直接輸入您說的內容',
      'Record Only': '只錄音',
      'Record with Recognition': '錄音並識別',
      'Speech Recognition is only provided in PC version.': '語音辨識功能僅支援電腦版本。',
      'Update Successfully': '更新成功',
    }
  },
  'zh-CN': {
    translation: {
      'ThisDictation Helper': 'ThisDictation 默书助手',
      'Content Input': '内容输入',
      'Enter words (one per line)': '输入词组（每行当作一个词组）',
      'Text Upload': '文字上传',
      'Voice Upload': '语音上传',
      'Image Upload': '图片上传',
      'Dictation Settings': '默书设置',
      'Reading Speed': '朗读速度',
      'Interval (seconds)': '间隔（秒）',
      'Repetitions': '重复次数',
      'Pronunciation': '发音',
      'Play': '播放',
      'Pause': '暂停',
      'Stop': '停止',
      'Previous': '上一个',
      'Next': '下一个',
      'Delete': '删除',
      'Delete All': '全部删除',
      'Export': '导出',
      'Cancel': '取消',
      'Confirm': '确认',
      'Start Recording': '开始录音',
      'Stop Recording': '停止录音',
      'Record Again': '重新录音',
      'Enter words to practice (one per line)': '输入你想练习的词语（每行一个）',
      'Recognize': '识别',
      'Language': '语言',
      'Cantonese': '粤语',
      'Mandarin': '普通话',
      'English': '英语',
      'Failed to process audio': '音频处理失败',
      'Are you sure you want to delete all words?': '确定要删除所有单字吗？',
      'There is no word to be added.': '没有可添加的单字。',
      'Word Progress': '单字进度',
      'Current Repetition': '当前重复次数',
      'No words added': '尚未添加单字',
      'of': '之',
      'word(s)': '个单字',
      'Key Features:': '主要功能：',
      'Guide': '使用指南',
      'Welcome to ThisDictation Helper!': '欢迎使用 ThisDictation 默书助手！',
      'user_guide.introduction': 'ThisDictation 默书助手是您制作和练习默书的最佳伙伴。无论您是准备教材的老师，还是帮助孩子提升语言能力的家长，我们的工具都能让整个过程变得简单有效。',
      'user_guide.feature_1': '多种输入方式：文字、语音和图片识别',
      'user_guide.feature_2': '可自定义朗读速度和间隔时间',
      'user_guide.feature_3': '支持多种语言（英语、粤语、普通话）',
      'user_guide.feature_4': '逐字播放并可重复',
      'user_guide.feature_5': '方便导出和导入单字清单，便于分享和复习',
      'user_guide.getting_started': '开始使用时，只需在文字区域输入单字，或使用语音/图片上传。您也可以导入现有的单字清单。',
      'Got it!': '知道了！',
      'Import txt file': '导入TXT檔',
      'Select a txt file': '选择TXT檔',
      'Document Language': '文件语言',
      'Traditional Chinese': '繁体中文',
      'Simplified Chinese': '简体中文',
      'Dictation Player': '默书播放器',
      'or': '或',
      'Failed to process image': '图片处理失败，请重试',
      'No text found in image': '图片中未找到文字',
      'No response from OCR service': 'OCR服务无响应',
      'Request timed out': '请求超时，请重试',
      'Please provide the words': '请提供词组',
      'Take Photo': '拍照片',
      'Select a file': '选择文件',
      'Number of Repetitions': '重复次数',
      'Reading Interval': '朗读间隔',
      'Upload Image': '上传图片',
      'Processing...': '处理中...',
      'Recognized text will appear here...': '识别文字将出现在这里...',
      'You can edit the transcribed text here or directly input the words you said': '您可以在此编辑转录的文字或直接输入您说的内容',
      'Record Only': '只录音',
      'Record with Recognition': '录音并识别',
      'Speech Recognition is only provided in PC version.': '语音识别功能仅支持电脑版本。',
      'Update Successful': '更新成功',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-TW',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;