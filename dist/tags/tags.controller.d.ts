import { TagsService } from './tags.service';
export declare class TagsController {
    private tagsService;
    constructor(tagsService: TagsService);
    getTags(): Promise<{
        tags: string[];
    }>;
}
