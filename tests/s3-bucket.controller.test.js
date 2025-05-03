// Mock env variables
process.env.AWS_ACCESS_KEY = "mock-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "mock-secret-key";
process.env.AWS_S3_BUCKET_REGION = "mock-region";
process.env.AWS_BUCKET_NAME = "test-bucket";

const AWS = require("aws-sdk");
const controller = require("../controllers/s3-bucket.controller");

// Mock AWS S3
jest.mock("aws-sdk", () => {
  const mockS3Instance = {
    listObjectsV2: jest.fn().mockReturnThis(),
    getObject: jest.fn().mockReturnThis(),
    putObject: jest.fn().mockReturnThis(),
    headObject: jest.fn().mockReturnThis(),
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return {
    S3: jest.fn(() => mockS3Instance),
  };
});

describe("S3 Bucket Controller", () => {
  let mockReq;
  let mockRes;
  let s3Mock;

  beforeEach(() => {
    // Reset mock for each test
    jest.clearAllMocks();

    // Create fresh req and res mocks
    mockReq = {
      user: {
        email: "test@example.com",
      },
      query: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
    };

    s3Mock = new AWS.S3();
  });

  describe("getUserTemplates", () => {
    it("should return a list of user templates", async () => {
      const mockFiles = [
        { Key: "test/file1.js", LastModified: new Date(), Size: 1024 },
        { Key: "test/file2.js", LastModified: new Date(), Size: 2048 },
      ];

      s3Mock.promise.mockResolvedValueOnce({
        Contents: mockFiles,
      });

      await controller.getUserTemplates(mockReq, mockRes);

      expect(s3Mock.listObjectsV2).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Prefix: "test/",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        files: expect.arrayContaining([
          expect.objectContaining({
            key: "test/file1.js",
            lastModified: expect.any(Date),
            size: 1024,
          }),
        ]),
      });
    });

    it("should return 400 if user email is missing", async () => {
      mockReq.user = {};
      await controller.getUserTemplates(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "User email not found",
      });
    });

    it("should return 500 if S3 operation fails", async () => {
      s3Mock.promise.mockRejectedValueOnce(new Error("S3 error"));

      await controller.getUserTemplates(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Failed to retrieve files from S3",
      });
    });
  });

  describe("getUserFileContent", () => {
    it("should return file content for authorized access", async () => {
      mockReq.query.fileKey = "test/sample.js";

      const fileContent =
        'const obj = `{"some":"content"}`;\nexport default obj;';

      s3Mock.promise.mockResolvedValueOnce({
        Body: Buffer.from(fileContent),
      });

      await controller.getUserFileContent(mockReq, mockRes);

      expect(s3Mock.getObject).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "test/sample.js",
      });
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(mockRes.send).toHaveBeenCalledWith(fileContent);
    });

    it("should return 400 if file key (name) is missing", async () => {
      await controller.getUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "File key is required",
      });
    });

    it("should return 403 for unauthorized file access", async () => {
      mockReq.query.fileKey = "another-user/sample.js";

      await controller.getUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied: Unauthorized file access",
      });
    });

    it("should return 500 if S3 operation fails", async () => {
      mockReq.query.fileKey = "test/sample.js";

      s3Mock.promise.mockRejectedValueOnce(new Error("S3 error"));

      await controller.getUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("saveUserFileContent", () => {
    it("should successfully save new file on S3", async () => {
      mockReq.body = {
        filename: "newfile",
        content: { some: "data" },
      };

      s3Mock.promise.mockRejectedValueOnce({ code: "NotFound" });
      s3Mock.promise.mockResolvedValueOnce({});

      await controller.saveUserFileContent(mockReq, mockRes);

      expect(s3Mock.headObject).toHaveBeenCalled();
      expect(s3Mock.putObject).toHaveBeenCalledWith({
        Bucket: expect.any(String),
        Key: "test/newfile.js",
        Body: expect.stringContaining("const obj = `"),
        ContentType: "application/javascript",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "File saved successfully",
      });
    });

    it("should return 409 if file already exists", async () => {
      mockReq.body = {
        filename: "existingfile",
        content: { some: "data" },
      };

      s3Mock.promise.mockResolvedValueOnce({});

      await controller.saveUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "File already exists",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      mockReq.body = { filename: "test" };

      await controller.saveUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Filename and content are required",
      });
    });

    it("should return 500 if checking file existence fails with unknown error", async () => {
      mockReq.body = {
        filename: "newfile",
        content: { some: "data" },
      };
      // Mock it to throw an some unknown error
      s3Mock.promise.mockRejectedValueOnce({ code: "OtherError" });

      await controller.saveUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 if S3 putObject fails", async () => {
      mockReq.body = {
        filename: "newfile",
        content: { some: "data" },
      };

      // Mock to throw NotFound error
      s3Mock.promise.mockRejectedValueOnce({ code: "NotFound" });
      s3Mock.promise.mockRejectedValueOnce(new Error("S3 error"));

      await controller.saveUserFileContent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteUserFile", () => {
    it("should delete file successfully for authorized access", async () => {
      mockReq.query.fileKey = "test/sample.js";

      s3Mock.promise.mockResolvedValueOnce({});

      await controller.deleteUserFile(mockReq, mockRes);

      expect(s3Mock.deleteObject).toHaveBeenCalledWith({
        Bucket: expect.any(String),
        Key: "test/sample.js",
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "File deleted successfully",
      });
    });

    it("should return 400 if fileKey is missing", async () => {
      await controller.deleteUserFile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "File key is required",
      });
    });

    it("should return 403 for unauthorized file access", async () => {
      mockReq.query.fileKey = "another-user/sample.js";

      await controller.deleteUserFile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Access denied: Unauthorized file access",
      });
    });

    it("should return 500 if S3 operation fails", async () => {
      mockReq.query.fileKey = "test/sample.js";

      s3Mock.promise.mockRejectedValueOnce(new Error("S3 error"));

      await controller.deleteUserFile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
