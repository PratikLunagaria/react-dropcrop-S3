import Dropzone from 'react-dropzone'

const MyDropzone = ({imgSrc, setImgData, currentImgURI, setCrop, setCropModalOpen, dropzoneTitle, style}) => {
  const onSelectFile = (files) => {
	if (files && files.length > 0) {
	  setCrop(undefined) // Makes crop preview update between images.
	  const reader = new FileReader()
	  reader.addEventListener('load', () =>
		setImgData(reader.result.toString() || ''),
	  )
	  reader.readAsDataURL(files[0])
	  setCropModalOpen(true)
	}
  }
  return (
	<Dropzone
	  accept={{
		'image/png': ['.png', '.jpg', '.jpeg', '.webp'],
	  }}
	  maxFiles={1}
	  multiple={false}
	  onDrop={(acceptedFiles, fileRejections) => onSelectFile(acceptedFiles)}
	>
	  {({getRootProps, getInputProps}) => (
		<div {...getRootProps()} >
		  <input type="file" accept="image/*" {...getInputProps()} />
		  {imgSrc ? <img src={imgSrc} alt={`${currentImgURI}`}
						 className={`h-28 w-40 border-2 border-dashed cursor-pointer flex items-center justify-center text-center ${style}`}/> :
			<span>{dropzoneTitle}</span>}
		</div>
	  )}
	</Dropzone>
  )
}
export default MyDropzone;
