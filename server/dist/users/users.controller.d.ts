import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';
import { SetOwnsCompanyDto } from './dto/set-owns-company.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly mediaService;
    constructor(usersService: UsersService, mediaService: MediaService);
    setOwnsCompany(req: any, body: SetOwnsCompanyDto): Promise<{
        user: import("./users.types").PublicUser;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        user: import("./users.types").PublicUser;
        avatarUrl: any;
    }>;
}
