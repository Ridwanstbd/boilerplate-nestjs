import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Contoh: "HR Manager"

  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[]; // List ID permission: [1, 2, 5]
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}

export class TogglePermissionDto {
  @IsInt()
  @IsNotEmpty()
  permissionId: number;
}
