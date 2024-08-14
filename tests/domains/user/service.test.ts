import { describe, it, expect, vi } from "vitest";
import { details } from "../../../src/domains/user/service";
import * as repository from "../../../src/domains/user/repository";
import {
  UserDetailsResponseDTO,
  UserDetail,
} from "../../../src/domains/user/type";

// Mock the repository
vi.mock("../../../src/domains/user/repository");

describe("User Service", () => {
  describe("details", () => {
    it("should return user details when user exists", async () => {
      // Arrange
      const mockUserId = 1;
      const mockUserDetails: UserDetail = {
        id: mockUserId,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        userName: "johndoe",
        password: "hashedpassword", // Include the required password field
        imagePublicId: "public_id_123",
        imageUrl: "https://example.com/image.jpg",
        role: "user",
        // verificationStatus: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
        // Add any other required fields from UserDetail type
      };

      // Mock the repository function
      vi.mocked(repository.getUserDetails).mockResolvedValue(mockUserDetails);

      // Act
      const result = await details(mockUserId);

      // Assert
      expect(repository.getUserDetails).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        id: mockUserDetails.id,
        firstName: mockUserDetails.firstName,
        lastName: mockUserDetails.lastName,
        email: mockUserDetails.email,
        userName: mockUserDetails.userName,
        image: mockUserDetails.userName, // This matches your function logic
        createdAt: mockUserDetails.createdAt,
      } as UserDetailsResponseDTO);
    });

    it("should throw an error when user is not found", async () => {
      // Arrange
      const mockUserId = 999; // Non-existent user ID

      // Mock the repository function to return null (user not found)
      vi.mocked(repository.getUserDetails).mockResolvedValue(null);

      // Act & Assert
      await expect(details(mockUserId)).rejects.toThrow("Not found");
      expect(repository.getUserDetails).toHaveBeenCalledWith(mockUserId);
    });
  });
});
