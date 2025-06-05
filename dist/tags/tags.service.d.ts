import { PrismaService } from 'src/prisma/prisma.service';
export declare class TagsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTags(): Promise<string[]>;
}
