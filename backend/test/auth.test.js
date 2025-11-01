import request, { Test } from "supertest"

const mockUser = { id: "a2a84b7a-f95a-4e37-a362-5bc78440281a", name: "MockUser" }

jest.mock("../utils/verify.js", () => ({
  verifyToken: (req, res, next) => {
    req.user = mockUser
    next()
  },
}))
import app from "../app.js"
import AuthModel from "../models/auth.model.js"
import jsonwebtoken from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { sendEmail } from '../services/emailService.js'
import authController from "../controllers/auth.controller.js"

jest.mock("../services/emailService.js")
jest.mock("../models/auth.model.js")
jest.mock("bcryptjs")
jest.mock("jsonwebtoken")

describe("Auth API", () => {
    describe("api/v1/auth/signup", () => {
        it("Should return 400 if username email or password are missing", async () => {
            const res = await request(app).post("/api/v1/auth/signup")
            expect(res.status).toBe(400)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 409 if the user already exists", async () => {
            const mockUser = {
                id: "user123",
                email: "example@gmail.com",
                username: "testuser"
            }
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            AuthModel.getUserByEmail.mockResolvedValueOnce(mockUser)
            const res = await request(app).post("/api/v1/auth/signup").send(mockRequest)
            expect(res.status).toBe(409)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 201 is the user signup is successful", async () => {
            const mockUser = {
                id: "user123",
                email: "example@gmail.com",
                username: "testuser",
                verification_token: "exampletoken"
            }
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            AuthModel.getUserByEmail.mockResolvedValueOnce(null)
            AuthModel.getStagingUserByEmail.mockResolvedValueOnce(null)
            AuthModel.createStagingUser.mockResolvedValueOnce(mockUser)
            sendEmail.mockResolvedValueOnce(null)
            const res = await request(app).post("/api/v1/auth/signup").send(mockRequest)
            expect(res.status).toBe(201)
            expect(res.body.status).toBe("success")
            expect(res.body.data.email).toBe("example@gmail.com")
        })
    })
    describe("api/v1/auth/signin", () => {
        it("Should return 400 if no username and email, or if no password is provided", async () => {
            const res = await request(app).post("/api/v1/auth/signin")
            expect(res.status).toBe(400)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 404 if the user cannot be found", async () => {
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            AuthModel.getUser.mockResolvedValueOnce(null)
            const res = await request(app).post("/api/v1/auth/signin").send(mockRequest)
            expect(res.status).toBe(404)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 401 if the invalid password match", async () => {
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            const mockValidUser = {
                id: "testid",
                username: "examplename",
                email: "example@gmail.com"
            }
            AuthModel.getUser.mockResolvedValueOnce(mockValidUser)
            const res = await request(app).post("/api/v1/auth/signin").send(mockRequest)
            expect(res.status).toBe(401)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 200 if sign in is successful", async () => {
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            const mockValidUser = {
                id: "testid",
                username: "examplename",
                email: "example@gmail.com",
                password_hash: "examplehash"
            }
            AuthModel.getUser.mockResolvedValueOnce(mockValidUser)
            bcryptjs.compareSync.mockResolvedValueOnce(true)
            jsonwebtoken.sign.mockResolvedValueOnce("exampletoken")
            
            const res = await request(app).post("/api/v1/auth/signin").send(mockRequest)
            
            expect(res.status).toBe(200)
            expect(res.headers["set-cookie"]).toBeDefined()
            expect(res.body.status).toBe("success")
        })
    })
    describe("api/v1/auth/signout", () => {
        it("Should return 200 when sign out is successful", async () => {
            const mockRequest = {
                email: "example@gmail.com",
                username: "testuser",
                password: "bingbong"
            }
            await request(app).post("/api/v1/auth/signin").send(mockRequest)
            const res = await request(app).post("/api/v1/auth/signout")
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
        })
    })
    describe("api/v1/auth/verify", () => {
        it("Should return 200 when verify is successful", async () => {
            const res = await request(app).get("/api/v1/auth/verify")
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
            expect(res.body.data.user).toEqual(mockUser)
        })
    })
    describe("api/v1/auth/user", () => {
        it("Should return 404 if the user cannot be found", async () => {
            AuthModel.getUserById.mockResolvedValueOnce(null)
            const res = await request(app).get("/api/v1/auth/user")
            expect(res.status).toBe(404)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 200 if the user is found", async () => {
            const mockUser = {
                id: "mockid",
                username: "mockuser",
                email: "mockemail"
            }
            AuthModel.getUserById.mockResolvedValueOnce(mockUser)
            const res = await request(app).get("/api/v1/auth/user")
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
            expect(res.body.data.user).toEqual(mockUser)
        })
    })
    describe("api/v1/auth/user/auth-methods", () => {
        it("Should return 200 and the list of auth methods", async () => {
            const mockResponse = [
                {provider: "local", provider_user_id: "examplemail@gmail.com"},
                {provider: "google", provider_user_id: "5592223"}
            ]
           AuthModel.getUserAuthMethods.mockResolvedValueOnce(mockResponse)
           const res = await request(app).get("/api/v1/auth/user/auth-methods")
           expect(res.status).toBe(200)
           expect(res.body.authMethods).toEqual(mockResponse)
        })
    })
    describe("api/v1/auth/delete/:id", () => {
        it("Should return 403 if current user does not match provided user", async () => {
            const res = await request(app).delete("/api/v1/auth/delete/notrightid")
            expect(res.status).toBe(403)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 200 and the deleted user if user is deleted successfully", async () => {
            const mockResponse = {
                id: "a2a84b7a-f95a-4e37-a362-5bc78440281a",
                username: "user",
                email: "testuser"
            }
            AuthModel.deleteUser.mockResolvedValueOnce(mockResponse)
            const res = await request(app).delete("/api/v1/auth/delete/a2a84b7a-f95a-4e37-a362-5bc78440281a")
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
            expect(res.body.data).toEqual(mockResponse)
        })
    })
    describe("api/v1/auth/verify-email", () => {
        it("Should return 400 if no token is provided", async () => {
            const res = await request(app).get("/api/v1/auth/verify-email")
            expect(res.status).toBe(400)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 200 if user is verified and created", async () => {
            const mockUser = {
                id: "123",
                username: "user123",
                email: "example@gmail.com"
            }
            AuthModel.verifyEmailAndCreateUser.mockResolvedValueOnce(mockUser)
            jsonwebtoken.sign.mockResolvedValueOnce("test")
            const res = await request(app).get("/api/v1/auth/verify-email").query({token: "1234"})
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
            expect(res.body.data.user).toEqual(mockUser)
            expect(res.headers["set-cookie"]).toBeDefined()
        })
    })
    describe("api/v1/auth/resend-verification", () => {
        it("Should return 400 if no email is provided", async () => {
            const res = await request(app).post("/api/v1/auth/resend-verification")
            expect(res.status).toBe(400)
        })
        it("Should return 400 if user is already verified", async () => {
            const mockUser = {
                id: "123",
                username: "user123",
                email: "example@gmail.com"
        }
            AuthModel.getUserByEmail.mockResolvedValueOnce(mockUser)
            const res = await request(app).post("/api/v1/auth/resend-verification").send({email: "example@gmail.com"})
            expect(res.status).toBe(400)
        })
        it("Should return 200 if verification is sent successfully", async () => {
            const mockUser = {
                id: "123",
                username: "user123",
                email: "example@gmail.com",
                verification_token: "abcd"
            }
            AuthModel.getUserByEmail.mockResolvedValueOnce(null)
            AuthModel.regenerateVerificationToken.mockResolvedValueOnce(mockUser)
            sendEmail.mockResolvedValueOnce(null)
            const res = await request(app).post("/api/v1/auth/resend-verification").send({email: "example@gmail.com"})
            expect(res.status).toBe(200)
        })
    })
    describe("api/v1/auth/update-username", () => {
        it("Should return 400 if no user id or username is given", async () => {
            const res = await request(app).patch("/api/v1/auth/update-username")
            expect(res.status).toBe(400)
        })
        it("Should return 403 if user id is not matching with verified user", async () => {
            const res = await request(app).patch("/api/v1/auth/update-username").send({userId: "notmatching"})
        })
        it("Should return 409 if username is already taken", async () => {
            const mockResponse = {
                id: "anotherid",
                username: "anothername",
                email: "example@gmail.com"
            }
            AuthModel.getUserByUsername.mockResolvedValueOnce(mockResponse)
            
            const res= await request(app).patch("/api/v1/auth/update-username").send({userId: mockUser.id, username: mockUser.name})
            
            expect(res.status).toBe(409)
        })
        it("Should return 200 if username is updated successfully", async () => {
            const mockResponse = {
                id: mockUser.id,
                username: "anothername",
                email: "example@gmail.com"
            }
            AuthModel.getUserByUsername.mockResolvedValueOnce(null)
            AuthModel.updateUsername.mockResolvedValueOnce(mockResponse)
            const res = await request(app).patch("/api/v1/auth/update-username").send({userId: mockUser.id, username: "anothername"})
            expect(res.status).toBe(200)
        })
    })
    describe("api/v1/auth/update-password", () => {
        it("Should return 400 if no user id and passwords are given", async () => {
            const res = await request(app).patch("/api/v1/auth/update-password")
            expect(res.status).toBe(400)
        })
        it("Should return 403 if user is not authorised", async () => {
            const mockRequest = {
                userId: "wrongid",
                currentPassword: "password",
                newPassword: "newpassword"
            }
            const res = await request(app).patch("/api/v1/auth/update-password").send(mockRequest)
        })
        it("Should return 404 if user is not found", async () => {
            const mockRequest = {
                userId: mockUser.id,
                currentPassword: "password",
                newPassword: "P@ssword123"
            }
            AuthModel.getUserWithPassword.mockResolvedValueOnce(null)
            const res = await request(app).patch("/api/v1/auth/update-password").send(mockRequest)
            expect(res.status).toBe(404)
        })
        it("Should return 401 if password is incorrect", async () => {
            const mockRequest = {
                userId: mockUser.id,
                currentPassword: "password",
                newPassword: "P@ssword123"
            }
            const mockResponse = {
                id: mockUser.id,
                username: mockUser.name,
                email: "testemail@gmail.com",
                password_hash: "examplehash"
            } 
            AuthModel.getUserWithPassword.mockResolvedValueOnce(mockResponse)
            bcryptjs.compareSync.mockReturnValueOnce(false)
            const res = await request(app).patch("/api/v1/auth/update-password").send(mockRequest)
            expect(res.status).toBe(401)
        })
        it("Should return 200 if password is updated successfully", async () => {
            const mockRequest = {
                userId: mockUser.id,
                currentPassword: "password",
                newPassword: "P@ssword123"
            }
            const mockResponse = {
                id: mockUser.id,
                username: mockUser.name,
                email: "testemail@gmail.com",
                password_hash: "examplehash"
            } 
            AuthModel.getUserWithPassword.mockResolvedValueOnce(mockResponse)
            bcryptjs.compareSync.mockReturnValueOnce(true)
            bcryptjs.hashSync.mockReturnValueOnce("randomhash")
            AuthModel.updatePassword.mockResolvedValueOnce({userId: "randomid"})
            const res = await request(app).patch("/api/v1/auth/update-password").send(mockRequest)
            expect(res.status).toBe(200)
        })
    })
    describe("api/v1/auth/add-local-password", () => {
        it("Should return 400 if user has already existing pasword", async () => {
            const mockResponse = [{
                provider: "local",
                provider_user_id: "sampleid"
            }]
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(mockResponse)
            const res = await request(app).post("/api/v1/auth/add-local-password").send({password: "P@ssword123"})
            expect(res.status).toBe(400)
        })
        it("Should return 400 if no password is given", async () => {
            const res = await request(app).post("/api/v1/auth/add-local-password")
            expect(res.status).toBe(400)
        })
        it("Should return 404 if user has already existing pasword", async () => {
            AuthModel.getUserAuthMethods.mockResolvedValueOnce([])
            AuthModel.getUserById.mockResolvedValueOnce(null)
            const res = await request(app).post("/api/v1/auth/add-local-password").send({password: "P@ssword123"})
            expect(res.status).toBe(404)
        })
        it("Should return 200 if adding local password is successful", async () => {
            AuthModel.getUserAuthMethods.mockResolvedValueOnce([])
            AuthModel.getUserById.mockResolvedValueOnce(null)
            bcryptjs.hashSync.mockReturnValueOnce("randomhash")
            AuthModel.linkAuthProvider.mockResolvedValueOnce({id: "randomid"})
            const res = await request(app).post("/api/v1/auth/add-local-password").send({password: "P@ssword123"})
            expect(res.status).toBe(404)
        })
    })
    describe("api/v1/auth/remove-oauth-method", () => {
        it("Should return 400 if no provider is given", async () => {
            const res = await request(app).delete("/api/v1/auth/remove-oauth-method")
            expect(res.status).toBe(400)
        })
        it("Should return 400 if local is the only authentication method", async () => {
            const mockResponse = [{
                provider: "local",
                provider_user_id: "randomid"
            }]
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(mockResponse)
            const res = await request(app).delete("/api/v1/auth/remove-oauth-method").send({provider: "local"})
            expect(res.status).toBe(400)
            expect(res.body.message).toBe("Cannot remove local authentication - it's your only login method")
        })
        it("Should return 404 if authentication method cannot be found", async () => {
            const mockResponse = [
                {
                provider: "local",
                provider_user_id: "randomid"
            },
            {
                provider: "google",
                provider_user_id: "randomid"
            }
        ]
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(mockResponse)
            const res = await request(app).delete("/api/v1/auth/remove-oauth-method").send({provider: "notexists", provider_user_id: "mockid"})
            expect(res.status).toBe(404)
        })
        it("Should return 200 if authentication method was deleted successfully", async () => {
            const mockResponse = [
                {
                provider: "local",
                provider_user_id: "randomid"
            },
            {
                provider: "google",
                provider_user_id: "randomid"
            }
        ]
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(mockResponse)
            AuthModel.removeAuthMethod.mockResolvedValueOnce({provider: "local"})
            
            const res = await request(app).delete("/api/v1/auth/remove-oauth-method").send({provider: "local"})
            expect(res.status).toBe(200)
        })
    })

    describe("api/v1/auth/update-email", () => {
        it("Should return 400 if user id or email not given", async () => {
            const res = await request(app).patch("/api/v1/auth/update-email")
            expect(res.status).toBe(400)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 403 if user is not authorised", async () => {
            mockRequest = {
                userId: "wrongid",
                email: "randomemail@gmail.com"
            }
            const res = await request(app).patch("/api/v1/auth/update-email").send(mockRequest)
            expect(res.status).toBe(403)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 404 if user cannot be found", async () => {
            const mockRequest = {
                userId: mockUser.id,
                email: "randomemail@gmail.com"
            }
            const authMethods = [{
                provider: "local",
                provider_user_id: mockUser.id
            }]
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(authMethods)
            AuthModel.getUserById.mockResolvedValueOnce(null)
            const res = await request(app).patch("/api/v1/auth/update-email").send(mockRequest)
            expect(res.status).toBe(404)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 409 if email has already been taken", async () => {
            const mockRequest = {
                userId: mockUser.id,
                email: "randomemail@gmail.com"
            }
            const authMethods = [{
                provider: "local",
                provider_user_id: mockUser.id
            }]
            const mockResponse = {
                id: mockUser.id,
                username: mockUser.user,
                email: "currentemail@gmail.com"
            }
            const otherUser = {
                id: "someotherid",
                username: "someothername",
                email: "randomemail@gmail.com"
            }
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(authMethods)
            AuthModel.getUserById.mockResolvedValueOnce(mockResponse)
            AuthModel.getUserByEmail.mockResolvedValueOnce(otherUser)
            const res = await request(app).patch("/api/v1/auth/update-email").send(mockRequest)
            expect(res.status).toBe(409)
            expect(res.body.status).toBe("fail")
        })
        it("Should return 200 if email change is successful", async () => {
            const mockRequest = {
                userId: mockUser.id,
                email: "randomemail@gmail.com"
            }
            const authMethods = [{
                provider: "local",
                provider_user_id: mockUser.id
            }]
            const mockResponse = {
                id: mockUser.id,
                username: mockUser.user,
                email: "currentemail@gmail.com"
            }
            const pendingEmail = {
                id: "randomid",
                user_id: "randomuser",
                old_email: "currentemail@gmail.com",
                new_email: "randomemail@gmail.com",
                verification_token: "sometoken"
            }
            AuthModel.getUserAuthMethods.mockResolvedValueOnce(authMethods)
            AuthModel.getUserById.mockResolvedValueOnce(mockResponse)
            AuthModel.getUserByEmail.mockResolvedValueOnce(null)
            AuthModel.createPendingEmailChange.mockResolvedValueOnce(pendingEmail)
            sendEmail.mockResolvedValueOnce(null)
            const res = await request(app).patch("/api/v1/auth/update-email").send(mockRequest)
            expect(res.status).toBe(200)
            expect(res.body.status).toBe("success")
        })
    })
    describe("api/v1/auth/verify-email-change", () => {
        it("Should return 400 if no token is provided", async () => {
            const res = await request(app).get("/api/v1/auth/verify-email-change")
            expect(res.status).toBe(400)
        })
        it("Should return 200 if email change is successful", async () => {
            const mockResponse ={
                user: "someid",
                oldEmail: "something@gmail.com",
                newEmail: "new@gmail.com"
            }
            AuthModel.verifyEmailChange.mockResolvedValueOnce(mockResponse)
            sendEmail.mockResolvedValueOnce(null)
            const res = await request(app).get("/api/v1/auth/verify-email-change").query({token: "sometoken"})
            expect(res.status).toBe(200)
            expect(res.body.user).toEqual(mockResponse.user)
        })
    })
    describe("api/v1/auth/pending-email-change", () => {
        it("Should return 404 if there is no pending email change", async () => {
            AuthModel.getPendingEmailChange.mockResolvedValueOnce(undefined)
            const res = await request(app).get("/api/v1/auth/pending-email-change")
            expect(res.status).toBe(404)
        })
        it("Should return 200 if pending change is retrieved", async () => {
            const mockResponse = {
                id: "someid",
                user_id: "someid",
                old_email: "old@gmail.com",
                new_email: "new@gmail.com",
                verification_token: "exampletoken",
                verification_expires: "exampletime",
                created_at: "exampletime"
            }
            AuthModel.getPendingEmailChange.mockResolvedValue(mockResponse)
            const { verification_token, ...safePendingChange } = mockResponse
            const res = await request(app).get("/api/v1/auth/pending-email-change")
            expect(res.status).toBe(200)
            expect(res.body.pendingChange).toEqual(safePendingChange)
        })
        it("Should return 404 if there are no pending email changes found", async () => {
            AuthModel.cancelPendingEmailChange.mockResolvedValueOnce(undefined)
            const res = await request(app).delete("/api/v1/auth/pending-email-change")
            expect(res.status).toBe(404)
        })
        it("Should return 200 if the change request is cancelled successfully", async () => {
            const mockResponse = {
                id: "someid",
                old_email: "old@gmail.com",
                new_email: "new@gmail.com"
            }
            AuthModel.cancelPendingEmailChange.mockResolvedValue(mockResponse)
            const res = await request(app).delete("/api/v1/auth/pending-email-change")
            expect(res.status).toBe(200)
        })
    })
    describe("api/v1/google/callback", () => {
    let mockReq, mockRes
    beforeEach(() => {
    mockReq = {
        user: {
            id: "google-id-123",
            displayName: "John Doe",
            emails: [{ value: "john@gmail.com", verified: true }],
        },
        }
        mockRes = {
        cookie: jest.fn(),
        send: jest.fn(),
        }
    })

    it("creates a new user if none exists", async () => {
        AuthModel.getUserByProvider.mockResolvedValue(null)
        AuthModel.getUserByEmail.mockResolvedValue(null)

        AuthModel.createGoogleUser.mockResolvedValue({
        id: "1",
        username: "John Doe",
        email: "john@gmail.com",
        })
        jsonwebtoken.sign.mockReturnValue("mock-token")

        await authController.googleCallback(mockReq, mockRes)

        expect(AuthModel.createGoogleUser).toHaveBeenCalled()
        expect(mockRes.cookie).toHaveBeenCalledWith(
        "access_token",
        "mock-token",
        expect.any(Object)
        )
        expect(mockRes.send).toHaveBeenCalled()
        })
    })
})