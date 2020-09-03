import {MigrationInterface, QueryRunner} from "typeorm";

export class emailunico1599012333288 implements MigrationInterface {
    name = 'emailunico1599012333288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP INDEX `IDX_97672ac88f789774dd47f7c8be`");
    }

}
