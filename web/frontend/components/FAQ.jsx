import { Card, Page, Layout, TextContainer, Heading, MediaCard, DisplayText, Collapsible, Stack, Button, Link, TextStyle, Icon } from "@shopify/polaris";
import {
    ChevronDownMinor, CirclePlusMinor
} from '@shopify/polaris-icons';
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from 'react';

export const FAQ = ({ q, a }) => {


    const [open, setOpen] = useState(false);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    return (
        <Card.Section>
            <Stack vertical>
                <Button plain monochrome removeUnderline fullWidth
                    onClick={handleToggle}
                    ariaExpanded={open}
                    ariaControls="basic-collapsible"
                >
                    <div className="faqBlock">
                        <Heading>

                            <TextStyle variation="subdued">{q}</TextStyle>
                        </Heading>
                        <Icon source={ChevronDownMinor} />
                    </div>

                </Button>
                <Collapsible
                    open={open}
                    id="basic-collapsible"
                    transition={{ duration: '300ms', timingFunction: 'ease-in-out' }}
                    expandOnPrint
                >
                    <TextContainer>
                        <p>
                            {a}
                        </p>

                    </TextContainer>
                </Collapsible>

            </Stack>
        </Card.Section>
    );

}