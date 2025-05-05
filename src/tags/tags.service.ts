import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getTags() {
    const tags = await this.prisma.article.findMany({
      select: {
        tagList: true,
      },
    });
    const flatTags = tags
      .map((tagList) => tagList.tagList)
      .reduce((a, b) => a.concat(b), []);
    const returnTags: string[] = [];
    flatTags.forEach((tag) => {
      if (!(returnTags?.includes(tag) || false)) returnTags.push(tag);
    });
    return returnTags;
  }
}
