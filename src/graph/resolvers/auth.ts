import { hash, compare } from 'bcrypt';
import { isAuth } from 'middlewares';
import { User } from 'models';
import {
  createAccessToken,
  createConfirmationCode,
  createRefreshToken,
} from 'services';
import {
  Resolver,
  Query,
  Mutation,
  ObjectType,
  Field,
  Arg,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import { Context } from '../types';
import nodemailer from 'nodemailer';
import { verify } from 'jsonwebtoken';

@ObjectType()
class LoginResponse {
  @Field()
  user: User;

  @Field()
  accessToken: string;
}

@Resolver()
export class AuthResolver {
  @Query(() => String)
  status() {
    return 'Server is Healthy!';
  }
  @Query(() => String)
  @UseMiddleware(isAuth)
  Check(@Ctx() { payload }: Context) {
    console.log(payload);
    return `your user id is ${payload!.userId} !`;
  }

  @Query(() => [User])
  async users() {
    return await User.query();
  }

  @Mutation(() => Number)
  async register(
    @Arg('email') email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    const hashedPassword = await hash(password, 10);
    await User.query().insert({
      email,
      username,
      password: hashedPassword,
    });

    const otp = this.sendEmail(email);
    return otp;
  }

  @Mutation(() => Number)
  async registerDealer(
    @Arg('email') email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('address') address: string,
    @Arg('phone') phone: string,
  ) {
    const hashedPassword = await hash(password, 10);
    await User.query().insert({
      email,
      username,
      password: hashedPassword,
      address,
      phone,
      dealer: true,
    });

    const otp = this.sendEmail(email);
    return otp;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context,
  ): Promise<LoginResponse> {
    const user = await User.query().findOne('email', email);
    if (!user) {
      throw new Error('Could not find user!');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error('Bad password!');
    }

    res.cookie('refresh-token', createRefreshToken(user));

    return {
      user,
      accessToken: createAccessToken(user),
    };
  }

  @Mutation(() => Boolean)
  async resetPassword(@Arg('email') email: string) {
    const user = await User.query()
      .findOne('email', email)
      .increment('count', 1);
    if (!user) {
      throw new Error('Could not find user!');
    }

    return true;

    // Rest of reset password logic
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
    }

    return {
      user,
      accessToken: createAccessToken(user),
    };
  }
}
