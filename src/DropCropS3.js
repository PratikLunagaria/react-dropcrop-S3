import {useEffect, useState} from "react";
import MyDropzone from "./drop/MyDropzone";
import CropDialog from "./crop/CropDialog";
import ImageCropComp from "./crop/ImageCropComp";
import {getS3} from "./utils/s3-utils";

const DropCropS3 = (
  {
	level = 'public',
	dirPath = '',
	currentImgURI = '',
	fixedHeight = 300,
	fixedWidth = 300,
	aspect = 1,
	onError = (e) => console.error(e),
	onSuccess = (s) => console.log(s),
	style = {dropzone: ''},
	dropzoneTitle = 'drag n drop',
	imgQuality=1
  }) => {
  const [imgSrc, setImgSrc] = useState(null)
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState();
  const [imgData, setImgData] = useState('')

  useEffect(async () => {
	if (currentImgURI) {
	  let sourceLink = await getS3(currentImgURI)
	  setImgSrc(sourceLink)
	}
  }, [currentImgURI])

  const handleSuccess = (e) => {
	onSuccess(e)
	setCropModalOpen(false)
  }

  return (
	<div>
	  <MyDropzone {...{
		imgSrc,
		setImgData,
		setCrop,
		setCropModalOpen,
		currentImgURI,
		dropzoneTitle,
		style: style.dropzone
	  }}/>
	  <CropDialog {...{isCropModalOpen, setCropModalOpen, title: "CROP IMAGE"}}>
		<ImageCropComp {...{
		  imgData,
		  setImgData,
		  dirPath,
		  currentImgURI,
		  level,
		  aspect,
		  crop,
		  setCrop,
		  setImgSrc,
		  onError,
		  onSuccess: handleSuccess,
		  fixedHeight,
		  fixedWidth,
		  imgQuality
		}}/>
	  </CropDialog>
	</div>
  )
}
export default DropCropS3;
