import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserForUpdate } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(user: User, dto: UserForUpdate) {
    try {
      const userUpdated = await this.prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          ...dto,
        },
      });
      return userUpdated;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException('email or username taken');
      }
    }
  }
}
