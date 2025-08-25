import React from 'react';
import Picker from 'emoji-picker-react';

//emoji-picker-react' library 

export default function MyEmojiPicker({ onEmojiSelect }) {
  

  const handleEmojiClick = (emojiObject) => {
    onEmojiSelect(emojiObject.emoji);
  };

  return (
    <Picker
      onEmojiClick={handleEmojiClick}
      pickerStyle={{ width: '100%', boxShadow: '0 5px 10px rgba(0,0,0,0.1)' }}
      searchDisabled={true}
      previewConfig={{ showPreview: false }}
    />
  );
}