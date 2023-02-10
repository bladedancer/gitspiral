import React, { useCallback, useEffect, useRef } from "react";
import { useRepoContext } from "../hooks/useRepo";

/**
 * The `RepoControl` create input for the repo selection
 *
 * ```jsx
 * <App>
 *   <ControlsContainer>
 *     <RepoControl />
 *   </ControlsContainer>
 * </App>
 * ```
 *
 * @category Component
 */
const RepoControl = ({
  className,
  style,
  children,
}) => {
  const { repo, setRepo } = useRepoContext();

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-control ${className || ""}`,
  };

  const setProjectFolder = useCallback((f) => {
    setRepo({
        ...repo,
        repo: f.target.value
    });
  }, [repo, setRepo])

  const setProjectSubFolder = useCallback((f) => {
    setRepo({
        ...repo,
        folder: f.target.value
    });
  }, [repo, setRepo])

  return (
    <>
      <div {...htmlProps}>
        <label>
            Git Repo Folder:
            <input type="text" value={repo.repo} onChange={setProjectFolder} />
        </label>
        <label>
            Project Folder (optional):
            <input type="text" value={repo.folder} onChange={setProjectSubFolder} />
        </label>

      </div>
    </>
  );
};

export default RepoControl;
