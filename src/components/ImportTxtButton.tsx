import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
const ImportTxtButton: React.FC = () => {
const { t } = useTranslation();
const { setWordSets } = useDictation();
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
const file = event.target.files?.[0];
if (file) {
// Check if the file has a .txt extension
const fileName = file.name.toLowerCase();
if (!fileName.endsWith('.txt')) {
alert(t('Please upload TXT file'));
event.target.value = ''; // Reset the input
return;
}
try {
const text = await file.text();
const importedWords = text
.split('\n')
.map(word => word.trim())
.filter(word => word.length > 0)
.map(text => ({ text }));
setWordSets(prevWords => [...prevWords, ...importedWords]);
event.target.value = ''; // Reset the input
} catch (error) {
console.error('Error importing file:', error);
}
}
};
return (
<div className="relative">
<input
type="file"
accept=".txt"
onChange={handleFileChange}
className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
/>
<button
className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
title={t('Import txt file')}
>
{t('Import TXT')}
</button>
</div>
);
};
export default ImportTxtButton;