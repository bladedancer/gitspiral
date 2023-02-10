import React, { useCallback, useEffect, useRef } from "react";
import { useRepoContext } from "../hooks/useRepo";
import Toggle from "../utils/Toggle.jsx";
import './repocontrol.css';

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
    className: `repo-control ${className || ""}`,
  };

  const setProjectFolder = useCallback((f) => {
    setRepo({
        ...repo,
        repo: f.target.value
    });
  }, [repo, setRepo])

  const setProjectSubFolder = useCallback((e) => {
    setRepo({
        ...repo,
        folder: e.target.value
    });
  }, [repo, setRepo])

  const toggleAllBranches = useCallback((f) => {
    setRepo({
        ...repo,
        all: !repo.all
    });
  }, [repo, setRepo])

  return (
    <>
      <div {...htmlProps}>
        <div className="text-repo-control">
          <label htmlFor="repo-repo-control">Git Repo Folder:</label>
          <input id="repo-repo-control" type="text" value={repo.repo} onChange={setProjectFolder} placeholder="Enter root project folder"/>
        </div>
        <div className="text-repo-control">
          <label htmlFor="folder-repo-control">Project Folder:</label>
          <input id="folder-repo-control" type="text" value={repo.folder} onChange={setProjectSubFolder} placeholder="Enter sub-folder (optional)"/>
        </div>
        <Toggle className="branches-repo-control"
            checked={repo.all}
            onChange={toggleAllBranches}
          >
            All Branches
        </Toggle>
      </div>
    </>
  );
};

export default RepoControl;
