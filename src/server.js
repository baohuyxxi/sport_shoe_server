/* eslint-disable no-console*/
import express from "express";
import { CONNECT_DATABASE, CLOSE_DATABASE } from "~/config/mongodb";
import exitHook from "async-exit-hook";
import { env } from "~/config/environment";
import cors from "cors";
import { APIs_V1 } from "~/routes/v1/index";
import { notFound, errorHandler } from "~/middleware/errorHandlingMiddleware";
import morgan from "morgan";
import cookieSession from "cookie-session";
import passport from "passport";
import path from "path";
import "dotenv/config";

const START_SERVER = () => {
  const app = express();

  // Enable req.body json data
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true
    })
  );

  const allowedDomains = [
    process.env.CLIENT_URL_VERCEL,
    process.env.ADMIN_URL_VERCEL,
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.ADMIN_FIAU_URL
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // bypass the requests with no origin (like curl requests, mobile apps, etc )
        if (!origin) return callback(null, true);

        if (allowedDomains.indexOf(origin) === -1) {
          var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      methods: "GET,POST,PUT,DELETE",
      credentials: true
    })
  );
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.COOKIE_SESSION_KEYS],
      maxAge: 24 * 60 * 80 * 1000
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(__dirname, "/public")));

  //Use APIs v1
  app.use("/api/v1", APIs_V1);

  // Middleware xử lý lỗi tập trung
  app.use(notFound);
  app.use(errorHandler);

  app.use(morgan("combined"));

  const PORT = env.APP_PORT || 1000;

  app.listen(PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `3. Hello ${env.AUTHOR} Back-end Server is running successfully at http://${env.APP_HOST}:${env.APP_PORT}/`
    );
  });

  // Thực hiện các tác vụ clean up trước khi dừng server
  exitHook(() => {
    console.log("4. Server is shutting down");
    CLOSE_DATABASE();
    console.log("5. Disconnected from MongoDB Cloud Atlas");
  });
};

console.log("1. Connecting to MongoDB Cloud Atlas");
CONNECT_DATABASE()
  .then(() => {
    console.log("2. Connected to MongoDb Cloud Atlas !");
  })
  .then(() => START_SERVER())
  .catch((err) => {
    console.error(err);
    process.exit(0);
  });