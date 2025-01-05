import { Column, Entity, PrimaryGeneratedColumn, Repository, DataSource } from 'typeorm';

@Entity('images')
export default class Image {
  static repository: Repository<Image>;

  static {
    // 初始化TypeORM数据源
    const dataSource = new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [Image],
      synchronize: true,
    });
    dataSource.initialize()
      .then(() => {
        this.repository = dataSource.getRepository(Image);
      })
      .catch(err => {
        console.error("Error initializing data source:", err);
      });
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    format?: string;
  };

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  getPublicUrl(): string {
    return `/uploads/${this.filename}`;
  }

  static findByTag(tag: string): Promise<Image[]> {
    return this.repository
      .createQueryBuilder('image')
      .where(':tag = ANY(image.tags)', { tag })
      .getMany();
  }
}
