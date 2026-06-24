import { getCoverComponent } from "./covers";

type BlogCoverProps = {
  cover?: string;
  coverComponent?: string;
};

export default function BlogCover({ cover, coverComponent }: BlogCoverProps) {
  if (coverComponent) {
    const Component = getCoverComponent(coverComponent);
    if (Component) {
      return (
        <div className="mb-8">
          <Component />
        </div>
      );
    }
  }

  if (cover) {
    return (
      <div className="mb-8 overflow-hidden rounded-xl">
        <img
          src={cover}
          alt="Blog cover"
          className="w-full object-cover"
        />
      </div>
    );
  }

  return null;
}
