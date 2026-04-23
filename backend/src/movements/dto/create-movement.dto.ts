import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateIf,
} from 'class-validator';
import { MovementType } from '../../common/enums';

export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsUUID()
  clientId: string;

  @IsUUID()
  productId: string;

  @IsUUID()
  qualityId: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  tons: number;

  @ValidateIf((o) => o.type === MovementType.AJUSTE)
  @IsString()
  @IsNotEmpty()
  notes?: string;
}
