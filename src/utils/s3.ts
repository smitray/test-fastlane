export type File = {
  data: string
  fileName: string | null
  fileSize: number
  height: number
  isVertical: boolean
  origURL: string
  type: string
  uri: string
  width: number
}

export async function uploadFile(url: string, file: File) {
  const resp = await fetch(file.uri)
  const fileData = await resp.blob()

  const response = await fetch(url, {
    method: 'PUT',
    body: fileData,
    headers: {
      'Content-Type': file.type,
    },
  })

  return response
}
