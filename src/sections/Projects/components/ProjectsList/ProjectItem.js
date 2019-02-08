// @flow

import React, { Fragment, useState, useCallback } from 'react';
import classnames from 'classnames';

import Table from 'semantic-ui-react/dist/commonjs/collections/Table';
import Input from 'semantic-ui-react/dist/commonjs/elements/Input';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Confirm from 'semantic-ui-react/dist/commonjs/addons/Confirm';
import Popup from 'semantic-ui-react/dist/commonjs/modules/Popup';

import { valueFromEventTarget } from 'core/dom';
import { render as renderComponent } from 'register/component';

import { useResponsive } from 'components/Responsive';
import ChangeOnBlurInput from 'components/ChangeOnBlurInput';

import ProjectInput from 'sections/Projects/components/ProjectInput';

import ProjectsList from './ProjectsList';

export type ProjectItemProps = {
  project: ProjectTreeType;
  level: number;
  onUpdateProject: (project: ProjectProps) => void;
  onRemoveProject: (id: string) => void;
  onArchiveProject: (id: string) => void;
  onChangeParent: (project: ProjectTreeType, parent: string | null) => void;
};

type confirmNames = '' | 'remove' | 'archive';

function useConfirmDelete(
  project: ProjectTreeType,
  onRemoveProject: (id: string) => void,
  onArchiveProject: (id: string) => void,
) {
  const [confirmDelete, setConfirmDelete] = useState<confirmNames>('');

  const onArchive = useCallback(() => setConfirmDelete('archive'));
  const onRemove = useCallback(() => setConfirmDelete('remove'));
  const onCancel = useCallback(() => setConfirmDelete(''));

  const confirms = {
    '': {
      text: '',
      buttonText: '',
      onConfirm: () => {},
    },
    remove: {
      text: 'Are you sure you want to remove this project?',
      buttonText: 'Remove project',
      onConfirm: () => {
        onCancel();
        onRemoveProject(project.id);
      },
    },
    archive: {
      text: `Do you want to ${project.archived ? 'unarchive' : 'archive'} this project?`,
      buttonText: project.archived ? 'Unarchive project' : 'Archive project',
      onConfirm: () => {
        onCancel();
        onArchiveProject(project.id);
      },
    },
  };

  return [confirmDelete, onArchive, onRemove, onCancel, confirms[confirmDelete]];
}

function ProjectItem(props: ProjectItemProps) {
  const {
    project,
    level,
    onUpdateProject,
    onRemoveProject,
    onArchiveProject,
    onChangeParent,
  } = props;
  const [confirmDelete, onArchive, onRemove, onCancel, confirmOptions] = useConfirmDelete(
    project,
    onRemoveProject,
    onArchiveProject,
  );
  const [isMobile] = useResponsive({ max: 'tablet' });

  const onChangeName = useCallback((name: string) => {
    onUpdateProject({
      ...project,
      name,
    });
  }, [project]);

  const onChangeParentProject = useCallback((parent: string | null) => {
    onChangeParent(project, parent);
  }, []);

  const NameInput = (
    <ChangeOnBlurInput
      type="text"
      value={project.name}
      onChange={onChangeName}
    />
  );

  const archiveText = project.archived ? 'Unarchive project' : 'Archive project';

  const ArchiveButton = (
    <Button icon onClick={onArchive}>
      <Icon name="archive" />
      {isMobile ? archiveText : ''}
    </Button>
  );

  const RemoveButton = (
    <Button icon onClick={onRemove}>
      <Icon name="remove" />
      {isMobile ? 'Remove project' : ''}
    </Button>
  );

  return (
    <Fragment>
      <Table.Row className={classnames('ProjectList__item ui form', { 'ProjectList__item--archived': !!project.archived })}>
        <Table.Cell className={`ProjectList__level-${level} field`}>
          {isMobile ? (
            <Fragment>
              <label>
                Project name
              </label>
              {NameInput}
            </Fragment>
          ) : (
            <div className="ProjectList__item-container">
              <div className="ProjectList__spacer" />
              <Icon name="caret right" />
              {NameInput}
            </div>
          )}
        </Table.Cell>
        {renderComponent('projects.tablerow.name', { ...props, isMobile })}
        <Table.Cell className="field">
          {isMobile && (
            <label>
              Parent project
            </label>
          )}
          <ProjectInput
            handleChange={onChangeParentProject}
            value={project.parent}
          />
        </Table.Cell>
        {renderComponent('projects.tablerow.parent', { ...props, isMobile })}
        <Table.Cell>
          {isMobile ? (
            ArchiveButton
          ) : (
            <Popup
              inverted
              trigger={ArchiveButton}
              content={archiveText}
            />
          )}
        </Table.Cell>
        <Table.Cell>
          {isMobile ? (
            RemoveButton
          ) : (
            <Popup
              inverted
              trigger={RemoveButton}
              content="Remove project"
            />
          )}
          <Confirm
            open={confirmDelete !== ''}
            content={confirmOptions.text}
            confirmButton={confirmOptions.buttonText}
            size="mini"
            onCancel={onCancel}
            onConfirm={confirmOptions.onConfirm}
          />
        </Table.Cell>
      </Table.Row>
      <ProjectsList
        parent={project.id}
        level={level + 1}
        onUpdateProject={onUpdateProject}
        onRemoveProject={onRemoveProject}
        onArchiveProject={onArchiveProject}
        onChangeParent={onChangeParent}
      />
    </Fragment>
  );
}

export default ProjectItem;
