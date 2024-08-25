import { Server as SocketServer, Socket } from "socket.io";
import { redisService } from "./redis-service";
import logger from "../libraries/log/logger";

function setupSocketEvents(io: SocketServer) {
  io.use(async (socket, next) => {
    const userId = socket.handshake.query.userId;

    if (typeof userId !== "string") {
      return next(new Error("Authentication error: Invalid user ID"));
    }
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    logger.info("New client connected");

    socket.on("register", async (userId: string) => {
      try {
        // Add this socket ID to the user's set of connections
        await redisService.sadd(
          `user:${socket.data.userId}:sockets`,
          socket.id
        );
        // Store the userId for this socket
        await redisService.set(`socket:${socket.id}`, socket.data.userId);
        logger.info(
          `User ${socket.data.userId} registered on device ${socket.id}`
        );
      } catch (error) {
        logger.error(`Error registering user ${userId}:`, error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("sjdshdu");

      try {
        const userId = await redisService.get(`socket:${socket.id}`);
        if (userId) {
          // Remove this socket ID from the user's set of connections
          await redisService.srem(
            `user:${socket.data.userId}:sockets`,
            socket.id
          );
          // Remove the socket-to-user mapping
          await redisService.delete(`socket:${socket.id}`);
          logger.info(
            `User ${socket.data.userId} disconnected from device ${socket.id}`
          );

          // Check if this was the last connection for this user
          const remainingConnections = await redisService.smembers(
            `user:${socket.data.userId}:sockets`
          );
          if (remainingConnections.length === 0) {
            logger.info(
              `User ${socket.data.userId} has no more active connections`
            );
            // Optionally, you can remove the user's set entirely
            await redisService.delete(`user:${socket.data.userId}:sockets`);
          }
        }
      } catch (error) {
        logger.error(
          `Error handling disconnect for socket ${socket.id}:`,
          error
        );
      }
    });
  });
}

async function sendNotification(
  io: SocketServer,
  userId: string,
  message: string
): Promise<void> {
  try {
    const socketIds = await redisService.smembers(`user:${userId}:sockets`);

    console.log(socketIds);

    if (socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        io.to(socketId).emit("notification", message);
      });
      logger.info(
        `Notification sent to user ${userId} on ${socketIds.length} device(s)`
      );
    } else {
      logger.info(`User ${userId} has no connected devices`);
    }
  } catch (error) {
    logger.error(`Error sending notification to user ${userId}:`, error);
  }
}

export { setupSocketEvents, sendNotification };
