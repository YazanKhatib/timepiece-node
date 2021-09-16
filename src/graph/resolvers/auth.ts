import nodemailer from 'nodemailer';
import { User } from 'models';
import { hash, compare } from 'bcrypt';
import { isAuth } from 'middlewares';
import { sign, verify } from 'jsonwebtoken';
import { UniqueViolationError } from 'objection';
import {
  createAccessToken,
  createConfirmationCode,
  createRefreshToken,
  Logger,
} from 'services';
import { Ctx, Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Context, LoginResponse } from '../types';

@Resolver()
export class AuthResolver {
  @Mutation(() => Number)
  async register(
    @Arg('email') email: string,
    @Arg('business_email', { nullable: true }) business_email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('phone', { nullable: true }) phone: string,
    @Arg('address', { nullable: true }) address: string,
    @Arg('role', { defaultValue: 'user' }) role: 'user' | 'dealer' | 'admin',
  ) {
    const hashedPassword = await hash(password, 10);
    const blocked = role === 'dealer' ? true : false;
    try {
      await User.query().insert({
        email,
        username,
        password: hashedPassword,
        phone,
        blocked,
        address,
        role,
      });
    } catch (e) {
      if (e instanceof UniqueViolationError)
        throw new Error('User already exist!');
      Logger.error(e.message);
      throw new Error(e.message);
    }

    const otp = await this.sendEmail(email);
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
      throw new Error('Wrong password!');
    }

    return {
      user,
      accessToken: createAccessToken(user),
      refreshToken: createRefreshToken(user),
    };
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

    try {
      const transporter = await nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'yazankhatib97@gmail.com',
          pass: 'stukhuycuxbroiue',
        },
      });

      await transporter.sendMail({
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
    } catch (e) {
      Logger.error(e.message);
    }

    return otp;
  }

  @Mutation(() => LoginResponse)
  async confirmEmail(@Arg('email') email: string, @Arg('code') code: string) {
    const user = await User.query().findOne('email', email);
    if (!user) {
      throw new Error('Could not find user!');
    }

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

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string) {
    const user = await User.query().findOne('email', email);
    if (!user) {
      throw new Error('Could not find user!');
    }
    const token = sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '1h',
    });

    const transporter = await nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'yazankhatib97@gmail.com',
        pass: 'stukhuycuxbroiue',
      },
    });
    await transporter.sendMail({
      to: email,
      from: '"Timepiece" <yazankhatib97@gmail.com>',
      subject: 'timepiece password reset',
      html: `
      <div>
        <table dir="ltr">
          <tbody>
              <tr>
                <td id="m_-1891783621300816003i2" style="padding:0;font-family:'Segoe UI Light','Segoe UI','Helvetica Neue Medium',Arial,sans-serif;font-size:41px;color:#2672ec">Password reset</td>
              </tr>
              <tr>
                <td id="m_-1891783621300816003i3" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">
                    Please use the following link to reset your password <a href="http://localhost:4000/reset-password/${token}">link</a>
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
    return true;
  }
}
