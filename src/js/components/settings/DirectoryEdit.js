// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeDirectory, loadDirectoryCertificate, trustDirectory,
  verifyDirectory, searchDirectory, changeSettings }
  from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Anchor from 'grommet/components/Anchor';
import Paragraph from 'grommet/components/Paragraph';
import Select from 'grommet/components/Select';
import RadioButton from 'grommet/components/RadioButton';
import AddIcon from 'grommet/components/icons/base/Add';
import EditIcon from 'grommet/components/icons/base/Edit';
import Certificate from '../Certificate';
import ErrorList from './ErrorList';

// Setting up a directory and groups takes place in multiple phases which
// must occur distinctly in this order:
// 1) Get the IP address or hostname of a directory server from the user
//    on Connect -> check whether this address is trusted
// 2) If not already trusted, the user must explicitly confirm trust
//    on Trust -> remember that the certificate is trusted
// 3) Get the Base DN to use for any search or authentication requests
//    from the user on Verify -> prompt for credentials, verify Base DN.
// 4) Configure directory group and role mappings
//    on OK -> done

class DirectoryEdit extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onCredentialsChange = this._onCredentialsChange.bind(this);
    this._onTypeChange = this._onTypeChange.bind(this);
    this._onSelectSearch = this._onSelectSearch.bind(this);
    this._onSelectChange = this._onSelectChange.bind(this);
    this._onTrust = this._onTrust.bind(this);
    this._onDontTrust = this._onDontTrust.bind(this);
    this._onAddGroup = this._onAddGroup.bind(this);
    this._onEditBase = this._onEditBase.bind(this);

    this.state = {
      busy: undefined,
      credentials: undefined,
      editBase: false,
      errors: {},
      needCredentials: false
    };
  }

  componentWillReceiveProps (nextProps) {
    var { directory, phase, response, roles } = nextProps;
    if (directory.certificate && 'Connecting' === this.state.busy) {
      this.setState({ busy: undefined });
    } else if ('search' === phase && 'Verifying' === this.state.busy) {
      this.setState({ busy: undefined });
    }
    if (response && 'ok' === response.result) {
      if (this.state.closeOnOk) {
        this.props.dispatch(changeSettings({directory: directory}));
        this.props.onClose();
      } else {
        // Ensure we have at least one of each type of role.
        // NOTE: consider moving this into the reducer.
        if (directory && directory.groups.length !== roles.length) {
          let usedRoles = {};
          directory.groups.forEach((group) => {
            usedRoles[group.role] = true;
          });
          while (directory.groups.length < roles.length) {
            // pick roles that haven't been used yet
            let index = 0;
            while (usedRoles[roles[index]]) index += 1;
            usedRoles[roles[index]] = true;
            directory.groups.push({ role: roles[index]});
          }
        }
      }
    }
  }

  _onSubmit () {
    const { directory, phase } = this.props;
    const { credentials, needCredentials } = this.state;
    let errors = {...this.state.errors};
    let noErrors = true;

    if ('identity' === phase) {
      if (! directory.address) {
        errors.address = 'required';
        noErrors = false;
      }
      if (noErrors) {
        this.setState({ busy: 'Connecting' });
        this.props.dispatch(loadDirectoryCertificate(directory));
      } else {
        this.setState({ errors: errors });
      }
    } else if ('verify' === phase || this.state.editBase) {
      if (! directory.baseDn) {
        errors.baseDn = 'required';
        noErrors = false;
      }
      if (noErrors) {
        if (needCredentials) {
          if (! credentials.userName) {
            errors.userName = 'required';
            noErrors = false;
          }
          if (! credentials.password) {
            errors.password = 'required';
            noErrors = false;
          }
        }
        if (noErrors) {
          if (credentials) {
            this.setState({ needCredentials: false, credentials: null,
              editBase: false, busy: 'Verifying' });
            this.props.dispatch(verifyDirectory(directory, credentials));
          } else {
            this.setState({
              needCredentials: true, credentials: {}, edtiBase: false
            });
          }
        } else {
          this.setState({ errors: errors });
        }
      } else {
        this.setState({ errors: errors });
      }
    } else if ('search' === phase) {
      // prune out any unfinished groups
      directory.groups = directory.groups.filter((group) => {
        return (group.role && group.dn);
      });
      this.props.dispatch(changeSettings({directory: directory}));
      this.props.onClose();
    }
  }

  _onChange (event) {
    let directory = { ...this.props.directory };
    let errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    const parts = attribute.split('.');
    if (parts.length === 1) {
      directory[attribute] = value;
      delete errors[attribute];
      if ('address' === attribute) {

      }
    } else {
      // e.g. groups.1.name
      const index = parseInt(parts[1], 10);
      while (directory.groups.length <= index) {
        directory.groups.push({});
      }
      directory.groups[index][parts[2]] = value;
    }
    this.setState({ errors: errors });
    this.props.dispatch(changeDirectory(directory));
  }

  _onCredentialsChange (event) {
    let credentials = { ...this.state.credentials };
    let errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    credentials[attribute] = value;
    delete errors[attribute];
    this.setState({ credentials: credentials, errors: errors });
  }

  _onTypeChange (type) {
    let directory = { ...this.props.directory };
    directory.type = type;
    this.props.dispatch(changeDirectory(directory));
  }

  _onSelectSearch (event) {
    let directory = {...this.props.directory};
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    const parts = attribute.split('.');
    const index = parseInt(parts[1], 10);
    while (directory.groups.length <= index) {
      directory.groups.push({});
    }
    if (value.indexOf('=') !== -1) {
      // looks like a dn
      directory.groups[index].dn = value;
    } else {
      directory.groups[index].cn = value;
      directory.groups[index].dn = undefined;
    }

    this.props.dispatch(searchDirectory(directory, index, value));
  }

  _onSelectChange (pseudoEvent) {
    let directory = {...this.props.directory};
    const attribute = pseudoEvent.target.getAttribute('name');
    const suggestion = pseudoEvent.option;
    const parts = attribute.split('.');
    const index = parseInt(parts[1], 10);
    while (directory.groups.length <= index) {
      directory.groups.push({});
    }
    directory.groups[index].dn = suggestion.value;
    directory.groups[index].cn = suggestion.label;
    this.props.dispatch(changeDirectory(directory));
  }

  _onTrust () {
    var directory = {...this.props.directory};
    directory.trust = true;
    this.props.dispatch(trustDirectory(directory));
  }

  _onDontTrust () {
    var directory = {...this.props.directory};
    delete directory.certificate;
    this.props.dispatch(changeDirectory(directory));
  }

  _onAddGroup (role) {
    var directory = {...this.props.directory};
    directory.groups.push({ role: role });
    this.props.dispatch(changeDirectory(directory));
  }

  _onEditBase () {
    this.setState({ editBase: true });
  }

  _renderBaseFields () {
    const { directory, phase, productName, settings } = this.props;
    const { errors } = this.state;

    let directoryErrors;
    if (settings.errors && settings.errors.directory) {
      directoryErrors = <ErrorList errors={settings.errors.directory} />;
    }

    let baseDnField;
    if ('identity' !== phase) {
      baseDnField = (
        <FormField htmlFor="baseDn"
          label="Base distinguished name (DN). For example: ou=groups,o=my.com"
          error={errors.baseDn}>
          <input id="baseDn" name="baseDn" type="text"
            value={directory.baseDn || ''} onChange={this._onChange} />
        </FormField>
      );
    }

    return (
      <fieldset>
        <Paragraph>Connect to a directory server to enable others to access
          this {productName}.</Paragraph>
        {directoryErrors}
        <FormField htmlFor="type">
          <RadioButton id="type-ldap" label="LDAP" name="type"
            checked={'ldap' === directory.type}
            onChange={this._onTypeChange.bind(this, 'ldap')} />
          <RadioButton id="type-ad" label="Active Directory" name="type"
            checked={'active directory' === directory.type}
            onChange={this._onTypeChange.bind(this, 'active directory')} />
        </FormField>
        <FormField htmlFor="address"
          label="Directory server host name or IP address. A :port is optional."
          error={errors.address}>
          <input id="address" name="address" type="text"
            value={directory.address || ''} onChange={this._onChange} />
        </FormField>
        {baseDnField}
      </fieldset>
    );
  }

  _renderBaseSummary () {
    const { directory } = this.props;
    return (
      <Box direction="row" justify="between" align="center"
        separator="horizontal">
        <span><strong>{directory.baseDn}</strong> via {directory.address}</span>
        <Button icon={<EditIcon />} onClick={this._onEditBase}
          a11yTitle={`Edit ${directory.baseDn} Directory`} />
      </Box>
    );
  }

  _renderCertificate (certificate) {
    return (
      <Certificate certificate={certificate}
        onTrust={this._onTrust} onDontTrust={this._onDontTrust} />
    );
  }

  _renderCredentials () {
    const { credentials, errors } = this.state;
    return (
      <LayerForm title="Directory Credentials" submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>To verify the configuration, we need credentials to
          access the directory. These will not be persisted.</Paragraph>
        <fieldset>
          <FormField htmlFor="userName" label="User name"
            error={errors.userName}>
            <input id="userName" name="userName" type="text"
              value={credentials.userName || ''}
              onChange={this._onCredentialsChange} />
          </FormField>
          <FormField htmlFor="password" label="Password"
            error={errors.password}>
            <input id="password" name="password" type="password"
              value={credentials.password || ''}
              onChange={this._onCredentialsChange} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }

  _renderRole (role) {
    const { directory, search, searchResponse } = this.props;
    let groups = [];
    directory.groups.forEach((group, index) => {
      if (group.role === role) {
        let value = { label: group.cn, value: group.dn };
        let options;
        if (search && search.groupIndex === index && searchResponse) {
          options = searchResponse.map((suggestion) => {
            return { label: suggestion.cn, value: suggestion.dn };
          });
        }
        groups.push(
          <FormField key={index} htmlFor={`groups.${index}.id`}
            label="Directory group identifier"
            help="Search via a plain string or an LDAP query">
            <Select id={`groups.${index}.id`}
              name={`groups.${index}.id`} type="text"
              value={value.label} onSearch={this._onSelectSearch}
              onChange={this._onSelectChange}
              options={options} />
          </FormField>
        );
      }
    });
    return (
      <fieldset key={role}>
        <Header size="small" justify="between">
          <Heading tag="h3">{role}</Heading>
          <Button icon={<AddIcon />} onClick={this._onAddGroup.bind(this, role)}
            a11yTitle={`Add ${role}`} />
        </Header>
        {groups}
      </fieldset>
    );
  }

  _renderGroups () {
    const { productName, roles } = this.props;
    const groupFields = roles.map((role) => {
      return this._renderRole(role);
    });
    return (
      <fieldset>
        <Heading tag="h3">Directory Groups</Heading>
        <Paragraph>Associate groups in the directory with
          the {productName} user roles.</Paragraph>
        {groupFields}
      </fieldset>
    );
  }

  _renderForm () {
    const { phase } = this.props;

    let summary;
    let contents;
    let submitLabel;
    if ('identity' === phase) {
      submitLabel = 'Connect';
      contents = this._renderBaseFields();
    } else if ('verify' === phase || this.state.editBase) {
      submitLabel = 'Verify';
      contents = this._renderBaseFields();
    } else if ('search' === phase) {
      submitLabel = 'OK';
      summary = this._renderBaseSummary();
      contents = this._renderGroups();
    }

    const accountControl = (
      <Anchor href="#" label="Edit local account" onClick={event => {
        event.preventDefault();
        this.props.onClose('accountEdit');
      }}/>
    );

    return (
      <LayerForm title="Directory" submitLabel={submitLabel}
        busy={this.state.busy}
        onClose={this.props.onClose} onSubmit={this._onSubmit}
        secondaryControl={accountControl}>
        {summary}
        {contents}
      </LayerForm>
    );
  }

  render () {
    const { directory, phase } = this.props;
    const { needCredentials } = this.state;
    let result;
    if ('trust' === phase) {
      result = this._renderCertificate(directory.certificate);
    } else if (needCredentials) {
      result = this._renderCredentials();
    } else {
      result = this._renderForm();
    }
    return result;
  }
}

DirectoryEdit.propTypes = {
  crendentials: PropTypes.object,
  directory: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  phase: PropTypes.oneOf(['identity', 'trust', 'verify', 'search']),
  productName: PropTypes.string,
  response: PropTypes.object,
  search: PropTypes.object,
  searchResponse: PropTypes.arrayOf(PropTypes.object),
  settings: PropTypes.object
};

let select = (state) => ({
  directory: state.directory.directory,
  phase: state.directory.phase,
  productName: state.settings.productName.short,
  response: state.directory.response,
  roles: state.directory.roles,
  search: state.directory.search,
  searchResponse: state.directory.searchResponse,
  settings: state.settings.settings
});

export default connect(select)(DirectoryEdit);
