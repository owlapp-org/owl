import DatabasesNode from "./DatabasesNode";
import FilesNode from "./FilesNode";
import "./styles.css";

export default function NavExplorer() {
  return (
    <>
      <DatabasesNode />
      <FilesNode />
    </>
  );
}
