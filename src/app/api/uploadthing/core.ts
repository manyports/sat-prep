import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

console.log("UploadThing initializing with credentials:", {
  secretDefined: !!process.env.UPLOADTHING_SECRET,
  appIdDefined: !!process.env.UPLOADTHING_APP_ID,
  tokenDefined: !!process.env.UPLOADTHING_TOKEN,
  secretFormat: process.env.UPLOADTHING_SECRET?.startsWith("sk_") ? "correct" : "incorrect"
});

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 4
    }
  })
  .middleware(() => {
    try {
      console.log("UploadThing middleware called");
      return { userId: "anonymous" };
    } catch (error) {
      console.error("UploadThing middleware error:", error);
      throw error;
    }
  })
  .onUploadComplete(async (data) => {
    try {
      console.log("Upload completed successfully:", {
        fileData: data.file,
        metadata: data.metadata
      });
      
      return {
        url: data.file.url,
        key: data.file.key
      };
    } catch (error) {
      console.error("Error in onUploadComplete:", error);
      throw error;
    }
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 