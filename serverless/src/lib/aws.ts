export const getS3Bucket = (): string => {
  if (process.env.S3_BUCKET_NAME !== undefined) {
    return process.env.S3_BUCKET_NAME
  }
  throw new Error('S3_BUCKET_NAME is not in process.env')
}

export const getObjectS3URL = (key: string): string => `https://${getS3Bucket()}.s3.amazonaws.com/${key}`

export const s3ObjectExists = async (s3: AWS.S3, key: string): Promise<boolean> => {
  try {
    await s3
      .headObject({
        Bucket: getS3Bucket(),
        Key: key,
      })
      .promise()
    return true
  } catch (error) {
    if (error.code === 'NotFound') {
      return false
    }
    throw error
  }
}

export const s3GetObjectOrUndefined = async (s3: AWS.S3, key: string): Promise<AWS.S3.GetObjectOutput | undefined> => {
  try {
    return s3
      .getObject({
        Bucket: getS3Bucket(),
        Key: key,
      })
      .promise()
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return undefined
    }
    throw error
  }
}
