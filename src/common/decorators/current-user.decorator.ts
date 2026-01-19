import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export const CurrentUser = createParamDecorator<User>(
  (_, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
