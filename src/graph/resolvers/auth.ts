import { hash, compare } from 'bcrypt';
import { isAuth } from 'middlewares';
import { User } from 'models';
import {
  createAccessToken,
  createConfirmationCode,
  createRefreshToken,
} from 'services';
import {
  Ctx,
  Arg,
  Field,
  Query,
  Mutation,
  Resolver,
  ObjectType,
  UseMiddleware,
} from 'type-graphql';
import { Context } from '../types';
import nodemailer from 'nodemailer';
import { verify } from 'jsonwebtoken';
import { UniqueViolationError } from 'objection';

@ObjectType()
class LoginResponse {
  @Field()
  user: User;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@Resolver()
export class AuthResolver {
  @Query(() => String)
  status() {
    return 'Server is Healthy!';
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async me(@Ctx() { payload }: Context) {
    const user = User.query().findById(payload!.userId);
    return user;
  }

  @Mutation(() => Number)
  async register(
    @Arg('email') email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('phone', { nullable: true }) phone: string,
    @Arg('address', { nullable: true }) address: string,
    @Arg('dealer', { defaultValue: false }) dealer: boolean,
    @Arg('isAdmin', { defaultValue: false }) isAdmin: boolean,
  ) {
    const hashedPassword = await hash(password, 10);
    const blocked = dealer ? true : false;
    try {
      await User.query().insert({
        email,
        username,
        password: hashedPassword,
        phone,
        dealer,
        blocked,
        address,
        isAdmin,
      });
    } catch (e) {
      if (e instanceof UniqueViolationError)
        throw new Error('User already exist!');
    }

    const otp = this.sendEmail(email);
    return otp;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('username', { nullable: true, defaultValue: null }) username: string,
    @Arg('password') password: string,
  ): Promise<LoginResponse> {
    const user = await User.query().findOne('username', username);

    if (!user) {
      throw new Error('Could not find user!');
    }

    if (!user.confirmed || user.blocked) {
      throw new Error('User account is not confirmed!');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error('Bad password!');
    }

    return {
      user,
      accessToken: createAccessToken(user),
      refreshToken: createRefreshToken(user),
    };
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateProfile(
    @Arg('phone', { defaultValue: undefined, nullable: true }) phone: string,
    @Arg('birth', { defaultValue: undefined, nullable: true }) birth: Date,
    @Arg('gender', { defaultValue: undefined, nullable: true }) gender: string,
    @Arg('address', { defaultValue: undefined, nullable: true })
    address: string,
    @Arg('isAdmin', { defaultValue: undefined, nullable: true })
    isAdmin: boolean,
    @Arg('blocked', { defaultValue: undefined, nullable: true })
    blocked: boolean,
    @Arg('last_name', { defaultValue: undefined, nullable: true })
    last_name: string,
    @Arg('first_name', { defaultValue: undefined, nullable: true })
    first_name: string,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query()
      .findById(payload!.userId)
      .patch({
        phone,
        birth,
        gender,
        address,
        last_name,
        first_name,
        blocked,
        isAdmin,
      })
      .returning('*');

    return user;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async resetPassword(
    @Arg('password') password: string,
    @Ctx() { payload }: Context,
  ) {
    const user = await User.query()
      .findOne('id', payload!.userId)
      .increment('count', 1);
    if (!user) {
      throw new Error('Could not find user!');
    }

    const hashedPassword = await hash(password, 10);

    await User.query().findOne('id', payload!.userId).patch({
      password: hashedPassword,
    });
    return true;
  }

  @Mutation(() => Number)
  async sendEmail(@Arg('email') email: string) {
    const { otp, token } = createConfirmationCode(1);
    await User.query().findOne('email', email).patch({
      token,
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yazankhatib97@gmail.com',
        pass: 'stukhuycuxbroiue',
      },
    });

    transporter.sendMail({
      from: '"Timepiece" <yazankhatib97@gmail.com>',
      to: email,
      subject: 'timepiece confirmation code',
      text: 'Confirm your account',
      html: `
        <div>
          <table dir="ltr">
            <tbody>
                <tr>
                  <td id="m_-1891783621300816003i2" style="padding:0;font-family:'Segoe UI Light','Segoe UI','Helvetica Neue Medium',Arial,sans-serif;font-size:41px;color:#2672ec">Security code</td>
                </tr>
                <tr>
                  <td id="m_-1891783621300816003i3" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">
                      Please use the following security code to confirm your account
                  </td>
                </tr>
                <tr>
                  <td id="m_-1891783621300816003i4" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">
                      Security code: <span style="font-family:'Segoe UI Bold','Segoe UI Semibold','Segoe UI','Helvetica Neue Medium',Arial,sans-serif;font-size:14px;font-weight:bold;color:#2a2a2a">${otp}</span>
                  </td>
                </tr>
                <tr>
                  <td id="m_-1891783621300816003i6" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">Thanks,</td>
                </tr>
                <tr>
                  <td id="m_-1891783621300816003i7" style="padding:0;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">Timepiece team</td>
                </tr>
            </tbody>
          </table>
          <div class="yj6qo"></div>
          <div class="adL"></div>
        </div>
      `,
    });

    return otp;
  }

  @Mutation(() => LoginResponse)
  async confirmEmail(@Arg('email') email: string, @Arg('code') code: string) {
    const user = await User.query().findOne('email', email);

    const token = verify(user.token, code);
    if (!token) {
      throw new Error('Invalid code');
    } else {
      await User.query().findOne('email', email).patch({
        confirmed: true,
      });
    }

    return {
      user,
      accessToken: createAccessToken(user),
      refreshToken: createRefreshToken(user),
    };
  }
}
