import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Flex, Input, InputGroup, InputLeftElement, List, ListItem } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import _, { debounce } from 'lodash';

const locationiqKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion, { isHighlighted }) {
  return (
    <ListItem
      // boxShadow="0 1px 5px rgba(0, 0, 0, 0.65)"
      borderWidth="1px"
      borderRadius="4px"
      styleType="none"
      padding="10px"
      style={{ cursor: "pointer" }}
      bgColor={isHighlighted ? 'gray.100' : 'white'} // Change background color on hover
    >
      {suggestion.name}
    </ListItem>
  );
}

class LocationInput extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      isLoading: false,
      highlightedIndex: null, // Track the highlighted index
    };

    this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 1000);
  }

  async loadSuggestions(value) {
    this.setState({
      isLoading: true,
    });

    try {
      // Make an API call to fetch suggestions based on the input value
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${locationiqKey}&q=${value}&limit=5`
      );
      const data = await response.json();

      const suggestions = data.map((item) => ({
        name: item.display_name,
        // Add other properties as needed
      }));

      if (value === this.state.value) {
        this.setState({
          isLoading: false,
          suggestions,
        });
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.setState({
        isLoading: false,
      });
    }
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });

    this.props.onChange(newValue);
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.debouncedLoadSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onSuggestionMouseEnter = (event, { index }) => {
    this.setState({
      highlightedIndex: index,
    });
  };

  onSuggestionMouseLeave = () => {
    this.setState({
      highlightedIndex: null,
    });
  };

  render() {
    const { value, suggestions, isLoading, highlightedIndex } = this.state;
    const inputProps = {
      placeholder: 'Where would you like to go?',
      value,
      onChange: this.onChange,
    };
    const status = isLoading ? 'Loading...' : 'Type to load suggestions';

    return (
      <div>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={(suggestion, { isHighlighted }) =>
            renderSuggestion(suggestion, { isHighlighted })
          }
          inputProps={inputProps}
          onSuggestionMouseEnter={this.onSuggestionMouseEnter}
          onSuggestionMouseLeave={this.onSuggestionMouseLeave}
          renderInputComponent={(inputProps) => (
            <InputGroup>
              <InputLeftElement>
                <SearchIcon />
              </InputLeftElement>
              <Input
                {...inputProps}
                borderWidth="1px"
                borderRadius="5px"
                width="280px"
              />
            </InputGroup>
          )}
          renderSuggestionsContainer={({ containerProps, children }) => (
            <Box {...containerProps} position="absolute" zIndex="1">
              <List bgColor="white" width="280px" styleType={'none'}>
                {React.Children.map(children, (child, index) =>
                  React.cloneElement(child, {
                    onMouseEnter: (event) => {
                      this.onSuggestionMouseEnter(event, { index });
                      if (child.props.onMouseEnter) {
                        child.props.onMouseEnter(event);
                      }
                    },
                    onMouseLeave: (event) => {
                      this.onSuggestionMouseLeave(event, { index });
                      if (child.props.onMouseLeave) {
                        child.props.onMouseLeave(event);
                      }
                    },
                  })
                )}
              </List>
            </Box>
          )}
        />
      </div>
    );
  }
}

export default LocationInput;
