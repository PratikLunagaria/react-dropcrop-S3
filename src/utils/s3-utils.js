import {Auth, Storage} from 'aws-amplify';
import {v4 as uuidv4} from 'uuid';

export const uploadToS3 = async ({
								   imgBlob,
								   dirPath = '',
								   currentImgURI = null,
								   level = 'public',
								   onProgress = (e) => console.log(e),
								   onError = (e) => console.error(e),
								   onSuccess = (s) => console.log(s)
								 }) => {
  const {identityId} = await Auth.currentUserCredentials();
  const fileName = `${uuidv4()}.png`;
  const objectKey = dirPath ? `${dirPath}/${fileName}` : fileName;

  if (currentImgURI) {
	console.log('has current image', currentImgURI)
	await Storage.remove(currentImgURI)
  }
  try {
	console.log(imgBlob, "image blob")
	await Storage.put(objectKey, imgBlob, {
	  level,
	  contentType: imgBlob.type,
	  resumable: true,
	  completeCallback: (event) => {
		onSuccess(objectKey)
	  },
	  progressCallback(progress) {
		console.log((100 * progress.loaded) / progress.total, "progress cb")
		onProgress(Math.round((100 * progress.loaded) / progress.total))
	  },
	  errorCallback: (err) => {
		onError(err)
	  }
	});
  } catch (err) {
	onError(err)
  }

  // let newImgURI = `${identityId}/${objectKey}`;
  console.log(objectKey, 'objectkey s3 utils')
  const imgSrc = await getS3(objectKey, level)
  console.log(imgSrc, 'accessible URL')
  return imgSrc;
};

export const getS3 = async (imgURI, level = 'public', identityId = undefined) => {
  identityId = identityId ? identityId : (await Auth.currentUserCredentials()).identityId;
  console.log(identityId)
  const imgURL = Storage.get(imgURI, {level, identityId});
  console.log(imgURL, "getS3")
  return imgURL;
}
