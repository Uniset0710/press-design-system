{attachments.map(att => {
  /** 이미지 여부 판단 */
  const isImage =
    att.mimeType?.startsWith('image') ||
    att.uri?.startsWith('data:image') ||
    /\.(png|jpe?g|gif|webp)$/i.test(att.url ?? '');

  const src = att.uri ?? att.url ?? '';
  console.log('Attachment render:', { att, isImage, src });  // 디버깅용

  return (
    <div key={att.id} className="relative group">
      {isImage && src ? (
        <img
          src={src}
          alt={att.filename}
          className="w-16 h-16 object-cover border rounded cursor-pointer"
          onClick={() => setPreviewSrc(src)}
        />
      ) : (
        <a href={att.url} download className="w-16 h-16 flex items-center justify-center border rounded text-sm text-gray-600 hover:bg-gray-50">
          {att.filename}
        </a>
      )}
      {/* 삭제 버튼 */}
      <button
        type="button"
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hidden group-hover:block"
        onClick={() => onDelete(att.id)}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
})} 