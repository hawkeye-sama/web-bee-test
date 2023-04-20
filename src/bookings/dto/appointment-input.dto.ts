import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class Client {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AppointmentInputDto {
  @IsNotEmpty()
  startTime: Date;

  @IsNotEmpty()
  endTime: Date;

  @ValidateNested({ each: true })
  @Type(() => Client)
  clients: Client[];
}
