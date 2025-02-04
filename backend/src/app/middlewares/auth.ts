import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../util';
import { AppError } from '../errors/AppError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.headers.authorization);
    const token = (req.headers.authorization as string).split(' ')[1];

    // if the token  sent from client
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    // check if the token is valid
    jwt.verify(
      token,
      config.jwt_access_secret as string,
      function (err, decoded) {
        // err
        if (err) {
          throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
        }
        // const { userEmail, userRole } = decoded;

        const role = (decoded as JwtPayload)?.userRole;

        if (requiredRoles && !requiredRoles.includes(role)) {
          throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You have no access to this route',
          );
        }
        req.userCredentials = decoded as JwtPayload;

        next();
      },
    );
  });
};

export default auth;
