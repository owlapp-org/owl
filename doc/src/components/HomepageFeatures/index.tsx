import Heading from "@theme/Heading";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Easy to get Started",
    Svg: require("@site/static/img/keyboard.svg").default,
    description: (
      <>
        Owl does not require complex architecture requirements. It's easy to
        install, manage and use.
      </>
    ),
  },
  {
    title: "Flexible and Easy to Extend",
    Svg: require("@site/static/img/connect.svg").default,
    description: (
      <>
        You can access different storage environments and query them using
        extensions.
      </>
    ),
  },
  {
    title: "Powered by DuckDB",
    Svg: require("@site/static/img/duckdb.svg").default,
    description: (
      <>Owl uses DuckDB to provide high performance and flexibility.</>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
