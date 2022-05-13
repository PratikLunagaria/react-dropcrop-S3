import {useRef, useState} from 'react'
import ReactCrop, {centerCrop, makeAspectCrop} from 'react-image-crop'
import {canvasPreview} from './canvasPreview'
import {useDebounceEffect} from '../hooks/useDebounceEffect'
import {uploadToS3} from "../utils/s3-utils";
import 'react-image-crop/dist/ReactCrop.css'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
const centerAspectCrop = (
  mediaWidth,
  mediaHeight,
  aspect,
) => {
  return centerCrop(
	makeAspectCrop(
	  {
		unit: '%',
		width: 90,
	  },
	  aspect,
	  mediaWidth,
	  mediaHeight,
	),
	mediaWidth,
	mediaHeight,
  )
}

const ImageCropComp = ({
						 imgData,
						 setImgData,
						 level,
						 dirPath,
						 currentImgURI,
						 aspect = 1,
						 crop,
						 setCrop,
						 setImgSrc,
						 onError,
						 onSuccess,
						 fixedHeight,
						 fixedWidth,
						 imgQuality
					   }) => {
  const previewCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  console.log(uploadProgress, "uploadProgress")
  const onImageLoad = (e) => {
	if (aspect) {
	  const {width, height} = e.currentTarget
	  setCrop(centerAspectCrop(width, height, aspect))
	}
  }

  useDebounceEffect(
	async () => {
	  if (
		completedCrop?.width &&
		completedCrop?.height &&
		imgRef.current &&
		previewCanvasRef.current
	  ) {
		// We use canvasPreview as it's much faster than imgPreview.
		canvasPreview(
		  imgRef.current,
		  previewCanvasRef.current,
		  completedCrop,
		  scale,
		  rotate,
		)
	  }
	},
	100,
	[completedCrop, scale, rotate],
  )

  // const handleToggleAspectClick = () => {
  // 	if (aspect) {
  // 		setAspect(undefined)
  // 	} else if (imgRef.current) {
  // 		const { width, height } = imgRef.current
  // 		setAspect(16 / 9)
  // 		setCrop(centerAspectCrop(width, height, 16 / 9))
  // 	}
  // }

  const handleCroppedImage = async () => {
	setUploadProgress(5)
	await previewCanvasRef.current.toBlob((imgBlob) => {
	  let sourceLink = uploadToS3({
		imgBlob,
		currentImgURI,
		dirPath,
		level,
		onError,
		onProgress: setUploadProgress,
		onSuccess
	  })
	  setImgSrc(sourceLink)
	}, ...Array(1), imgQuality)
  }

  return (
	<div className="flex flex-col">
	  <div className={"flex"}>
		<div>
		  {Boolean(imgData) && (
			<ReactCrop
			  crop={crop}
			  onChange={(_, percentCrop) => setCrop(percentCrop)}
			  onComplete={(c) => setCompletedCrop(c)}
			  aspect={aspect}
			  style={{maxHeight: '70vh'}}
			>
			  <img
				ref={imgRef}
				alt="Crop me"
				src={imgData}
				style={{transform: `scale(${scale}) rotate(${rotate}deg)`}}
				onLoad={onImageLoad}
			  />
			</ReactCrop>
		  )}
		</div>
		<div className={"pl-4"}>

		  <div className={"min-h-96 min-w-96 bg-gray-200 flex flex-col items-center px-2 pt-2 pb-6 rounded-md mb-4"}>
			<div className="text-lg font-medium leading-6 text-gray-900 pb-2">
			  Preview
			</div>
			{Boolean(completedCrop) && (
			  <canvas
				ref={previewCanvasRef}
				style={{
				  border: '1px solid black',
				  objectFit: 'contain',
				  width: fixedWidth,
				  height: fixedHeight,
				}}
			  />
			)}
		  </div>
		  <div className="Crop-Controls p-2">
			<div className={"p-2"}>
			  <div className="relative pt-1">
				<div className={"mb-4"}>
				  <label htmlFor="scale-input" className="scale-input">Scale: </label>
				  <input
					id="rotate-input"
					type="number"
					value={scale}
					disabled={!imgData}
					onChange={(e) => setScale(Number(e.target.value))}
					className={"ml-2"}
				  />
				</div>
				<input
				  type="range"
				  className="form-range appearance-none w-full h-6 p-1 bg-blue-100 rounded-full focus:outline-none focus:ring-0 focus:shadow-none"
				  id="scale-input-range"
				  step="0.01"
				  min={-2}
				  max={10}
				  value={scale}
				  disabled={!imgData}
				  onChange={(e) => setScale(Number(e.target.value))}
				/>
			  </div>
			</div>
			<div>
			  <div className={"mb-4"}>
				<label htmlFor="rotate-input">Rotate: </label>
				<input
				  id="rotate-input"
				  type="number"
				  value={rotate}
				  disabled={!imgData}
				  onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
				  className={"ml-2"}
				/>
			  </div>
			  <input
				type="range"
				className="form-range appearance-none w-full h-6 p-1 bg-blue-100 rounded-full focus:outline-none focus:ring-0 focus:shadow-none"
				id="rotate-input-range"
				step="0.01"
				min={-180}
				max={180}
				value={rotate}
				disabled={!imgData}
				onChange={(e) =>
				  setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
				}
			  />
			</div>
			{/*<div className={"flex items-center py-2"}>*/}
			{/*	<label htmlFor="toggle-aspect">*/}
			{/*		Lock aspect:*/}
			{/*	</label>*/}
			{/*	<Switch*/}
			{/*		id={"toggle-aspect"}*/}
			{/*		checked={aspect}*/}
			{/*		onChange={handleToggleAspectClick}*/}
			{/*		className={`${aspect ? 'bg-blue-700' : 'bg-blue-200'} items-center p-1 relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full  transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}*/}
			{/*	>*/}
			{/*		<span className="sr-only">Use setting</span>*/}
			{/*		<span*/}
			{/*			aria-hidden="true"*/}
			{/*			className={`${aspect ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}*/}
			{/*		/>*/}
			{/*	</Switch>*/}
			{/*</div>*/}
		  </div>
		  <div className={"flex items-center justify-end"}>
			<button onClick={handleCroppedImage}
					className={"rounded-md bg-blue-100 px-3 py-1 text-blue-700 font-semibold"}>Save
			</button>
		  </div>
		</div>

	  </div>
	  <div className={"w-full h-1 my-2"}>
		{
		  uploadProgress ?
			<div className={"w-full bg-gray-200 h-1 my-2"}>
			  <div className={`bg-blue-600 h-1 w-[${uploadProgress}%]`}></div>
			</div>
			: <></>
		}
	  </div>
	</div>
  )
}
export default ImageCropComp
